const { Bot } = require('grammy');

async function startTelegramBot(relay) {
    const bot = new Bot(process.env.TELEGRAM_TOKEN);
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_INTERVAL = 5000; // 5 seconds

    async function connect() {
        try {
            // First, try to stop any existing webhook
            try {
                console.log('Removing existing webhook...');
                await bot.api.deleteWebhook({ drop_pending_updates: true });
                // Wait a moment to ensure webhook is fully removed
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.log('No existing webhook to remove:', error.message);
            }

            bot.on('message', async (ctx) => {
                try {
                    console.log('Telegram message received:', {
                        from: ctx.message.from.username,
                        chatId: ctx.message.chat.id,
                        chatType: ctx.message.chat.type,
                        text: ctx.message.text
                    });
                    await relay.relayToDiscord(ctx.message);
                } catch (error) {
                    console.error('Error handling Telegram message:', error);
                }
            });

            // Handle connection errors
            bot.catch(async (err) => {
                console.error('Telegram bot error:', err);
                if (err.message.includes('restart') || err.message.includes('connection') || err.error_code === 409) {
                    await handleReconnect();
                }
            });

            console.log('Telegram bot starting...');
            relay.setTelegramBot(bot);

            // Start the bot with specific options
            await bot.start({
                drop_pending_updates: true,
                allowed_updates: ["message"],
                timeout: parseInt(process.env.TELEGRAM_POLLING_TIMEOUT || "30"),
                limit: parseInt(process.env.TELEGRAM_POLLING_LIMIT || "100"),
                onStart: () => {
                    console.log('Telegram bot successfully started');
                    reconnectAttempts = 0;
                }
            });

            // Add periodic health check
            setInterval(async () => {
                try {
                    await bot.api.getMe();
                } catch (error) {
                    console.log('Health check failed, attempting reconnect...');
                    await handleReconnect();
                }
            }, 60000); // Check every minute

            return bot;
        } catch (error) {
            console.error('Error in connect():', error);
            throw error;
        }
    }

    async function handleReconnect() {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached. Please check your connection and restart the bot.');
            process.exit(1);
        }

        reconnectAttempts++;
        console.log(`Attempting to reconnect... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

        try {
            await bot.stop();
        } catch (error) {
            console.log('Error stopping bot before reconnect:', error);
        }

        await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL));
        
        try {
            await connect();
            console.log('Reconnection successful!');
        } catch (error) {
            console.error('Reconnection failed:', error);
            await handleReconnect(); // Try again
        }
    }

    return connect();
}

module.exports = { startTelegramBot }; 
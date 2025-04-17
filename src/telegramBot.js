const { Bot } = require('grammy');

async function startTelegramBot(relay) {
    const bot = new Bot(process.env.TELEGRAM_TOKEN);
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_INTERVAL = 5000; // 5 seconds

    async function connect() {
        try {
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
                
                if (err.message.includes('restart') || err.message.includes('connection')) {
                    await handleReconnect();
                }
            });

            console.log('Telegram bot starting...');
            relay.setTelegramBot(bot);
            
            await bot.api.deleteWebhook();
            await bot.start({
                drop_pending_updates: true,
                onStart: () => {
                    console.log('Telegram bot successfully started');
                    reconnectAttempts = 0; // Reset counter on successful connection
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
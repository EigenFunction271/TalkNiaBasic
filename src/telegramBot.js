const { Bot } = require('grammy');

async function startTelegramBot(relay) {
    const bot = new Bot(process.env.TELEGRAM_TOKEN);
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_INTERVAL = 5000;

    async function connect() {
        try {
            // More aggressive cleanup of existing sessions
            try {
                console.log('Cleaning up existing sessions...');
                // First, stop any webhooks
                await bot.api.deleteWebhook({ drop_pending_updates: true });
                // Wait longer to ensure cleanup
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Try to close any existing connections
                try {
                    await bot.stop();
                } catch (e) {
                    // Ignore stop errors
                }

                // Additional cleanup steps
                try {
                    // Force close any existing getUpdates
                    await bot.api.getUpdates({ offset: -1, limit: 1 });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (e) {
                    console.log('Cleanup getUpdates status:', e.message);
                }
            } catch (error) {
                console.log('Cleanup status:', error.message);
            }

            // Configure bot with more specific options
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

            // More specific error handling
            bot.catch(async (err) => {
                console.error('Telegram bot error:', {
                    code: err.error_code,
                    description: err.description,
                    message: err.message
                });
                
                // Only reconnect for specific errors
                if (err.error_code === 409 || 
                    err.message.includes('restart') || 
                    err.message.includes('connection')) {
                    await handleReconnect();
                }
            });

            console.log('Telegram bot starting with polling...');
            relay.setTelegramBot(bot);

            // Start with more specific options
            await bot.start({
                drop_pending_updates: true,
                allowed_updates: ["message"],
                timeout: 30,
                limit: 100,
                onStart: () => {
                    console.log('Telegram bot successfully started');
                    reconnectAttempts = 0;
                }
            });

            return bot;
        } catch (error) {
            console.error('Error in connect():', {
                code: error.error_code,
                description: error.description,
                message: error.message
            });
            throw error;
        }
    }

    async function handleReconnect() {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached. Exiting...');
            process.exit(1);
        }

        reconnectAttempts++;
        console.log(`Attempting to reconnect... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

        try {
            await bot.stop();
        } catch (error) {
            console.log('Stop status during reconnect:', error.message);
        }

        // Longer wait between attempts
        await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL * reconnectAttempts));
        
        return connect();
    }

    return connect();
}

module.exports = { startTelegramBot }; 
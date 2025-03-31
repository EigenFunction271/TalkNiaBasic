const { Bot } = require('grammy');

async function startTelegramBot(relay) {
    const bot = new Bot(process.env.TELEGRAM_TOKEN);

    bot.on('message', async (ctx) => {
        // Ignore messages from other groups
        if (ctx.chat.id.toString() !== process.env.TELEGRAM_GROUP_ID) return;

        await relay.relayToDiscord({
            from: {
                username: ctx.from.username || ctx.from.first_name
            },
            text: ctx.message.text
        });
    });

    console.log('Telegram bot started');
    relay.setTelegramBot(bot);
    
    // Start the bot
    await bot.start();
    return bot;
}

module.exports = { startTelegramBot }; 
const { Bot } = require('grammy');

async function startTelegramBot(relay) {
    const bot = new Bot(process.env.TELEGRAM_TOKEN);

    bot.on('message', async (ctx) => {
        await relay.relayToDiscord(ctx.message);
    });

    console.log('Telegram bot started');
    relay.setTelegramBot(bot);
    
    await bot.start();
    return bot;
}

module.exports = { startTelegramBot }; 
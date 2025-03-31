require('dotenv').config();
const { startDiscordBot } = require('./src/discordBot');
const { startTelegramBot } = require('./src/telegramBot');
const { initializeRelay } = require('./src/messageRelay');

async function startBridge() {
    try {
        const relay = initializeRelay();
        const discordBot = await startDiscordBot(relay);
        const telegramBot = await startTelegramBot(relay);

        console.log('Messenger Bridge is running!');
    } catch (error) {
        console.error('Failed to start Messenger Bridge:', error);
        process.exit(1);
    }
}

startBridge(); 
require('dotenv').config();
const express = require('express');
const { startDiscordBot } = require('./src/discordBot');
const { startTelegramBot } = require('./src/telegramBot');
const { initializeRelay } = require('./src/messageRelay');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    discord: discordBot?.isReady() ?? false,
    telegram: true, // Grammy doesn't have a direct isReady check
    uptime: process.uptime()
  });
});

let discordBot = null;

async function startBridge() {
    try {
        const relay = initializeRelay();
        discordBot = await startDiscordBot(relay);
        const telegramBot = await startTelegramBot(relay);

        // Start Express server
        app.listen(port, () => {
            console.log(`Web server running on port ${port}`);
        });

        console.log('Messenger Bridge is running!');
    } catch (error) {
        console.error('Failed to start Messenger Bridge:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  // Add any cleanup here if needed
  process.exit(0);
});

startBridge(); 
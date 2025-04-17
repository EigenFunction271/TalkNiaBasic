const { Client, GatewayIntentBits } = require('discord.js');

async function startDiscordBot(relay) {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_INTERVAL = 5000;

    async function connect() {
        try {
            client.on('messageCreate', async message => {
                if (message.author.bot) return;
                await relay.relayToTelegram(message);
            });

            client.on('error', async (error) => {
                console.error('Discord bot error:', error);
                await handleReconnect();
            });

            // Add reconnection handling for disconnects
            client.on('disconnect', async () => {
                console.log('Discord bot disconnected');
                await handleReconnect();
            });

            // Add health check on resumed connections
            client.on('resumed', () => {
                console.log('Discord connection resumed');
                reconnectAttempts = 0; // Reset counter
            });

            await client.login(process.env.DISCORD_TOKEN);
            console.log('Discord bot logged in as', client.user.tag);
            relay.setDiscordBot(client);

            return client;
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
            await client.destroy();
        } catch (error) {
            console.log('Error destroying client before reconnect:', error);
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

module.exports = { startDiscordBot }; 
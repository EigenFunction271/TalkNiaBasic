const { Client, GatewayIntentBits } = require('discord.js');

async function startDiscordBot(relay) {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    });

    client.on('ready', () => {
        console.log(`Discord bot logged in as ${client.user.tag}`);
    });

    client.on('messageCreate', async (message) => {
        // Ignore bot messages
        if (message.author.bot) return;
        await relay.relayToTelegram(message);
    });

    await client.login(process.env.DISCORD_TOKEN);
    relay.setDiscordBot(client);
    return client;
}

module.exports = { startDiscordBot }; 
class MessageRelay {
    constructor(mappings) {
        this.discordBot = null;
        this.telegramBot = null;
        this.mappings = mappings;
    }

    setDiscordBot(bot) {
        this.discordBot = bot;
    }

    setTelegramBot(bot) {
        this.telegramBot = bot;
    }

    findDiscordMapping(channelId) {
        return this.mappings.find(m => m.discord.channelId === channelId);
    }

    findTelegramMapping(groupId) {
        return this.mappings.find(m => m.telegram.groupId === groupId.toString());
    }

    async relayToTelegram(message) {
        try {
            if (!this.telegramBot) throw new Error('Telegram bot not initialized');
            
            // Find mapping based on Discord server and channel
            const mapping = this.mappings.find(m => 
                m.discord.serverId === message.guildId &&
                m.discord.channels.some(ch => 
                    ch.id === message.channelId &&
                    ch.name === message.channel.name
                )
            );

            if (!mapping) return; // Skip if no mapping found

            // Find the corresponding Telegram chat
            const discordChannel = mapping.discord.channels.find(ch => 
                ch.id === message.channelId
            );
            
            const telegramChat = mapping.telegram.channels.find(ch =>
                ch.name === discordChannel.mappedTo
            );

            if (!telegramChat) return;

            const formattedMessage = `Discord | ${message.author}: ${message.content}`;
            await this.telegramBot.api.sendMessage(telegramChat.id, formattedMessage);
        } catch (error) {
            console.error('Failed to relay message to Telegram:', error);
        }
    }

    async relayToDiscord(message) {
        try {
            if (!this.discordBot) throw new Error('Discord bot not initialized');
            
            const mapping = this.findTelegramMapping(message.chat.id);
            if (!mapping) return; // Skip if no mapping found

            const formattedMessage = `Telegram | ${message.from.username || message.from.first_name}: ${message.text}`;
            const channel = await this.discordBot.channels.fetch(mapping.discord.channelId);
            await channel.send(formattedMessage);
        } catch (error) {
            console.error('Failed to relay message to Discord:', error);
        }
    }
}

function initializeRelay() {
    try {
        // First try to read from file
        try {
            const bridges = require('../config/channels.json').bridges;
            return new MessageRelay(bridges);
        } catch (error) {
            // If file doesn't exist, try environment variable
            if (process.env.CHANNEL_MAPPINGS) {
                const bridges = JSON.parse(process.env.CHANNEL_MAPPINGS).bridges;
                return new MessageRelay(bridges);
            }
            console.error('Error loading channel configuration:', error);
            console.log('Please either create config/channels.json or set CHANNEL_MAPPINGS environment variable');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error initializing relay:', error);
        process.exit(1);
    }
}

module.exports = { initializeRelay }; 
class MessageRelay {
    constructor() {
        this.discordBot = null;
        this.telegramBot = null;
    }

    setDiscordBot(bot) {
        this.discordBot = bot;
    }

    setTelegramBot(bot) {
        this.telegramBot = bot;
    }

    async relayToTelegram(message) {
        try {
            if (!this.telegramBot) throw new Error('Telegram bot not initialized');
            const formattedMessage = `Discord | ${message.author}: ${message.content}`;
            await this.telegramBot.api.sendMessage(process.env.TELEGRAM_GROUP_ID, formattedMessage);
        } catch (error) {
            console.error('Failed to relay message to Telegram:', error);
        }
    }

    async relayToDiscord(message) {
        try {
            if (!this.discordBot) throw new Error('Discord bot not initialized');
            const formattedMessage = `Telegram | ${message.from.username}: ${message.text}`;
            const channel = await this.discordBot.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            await channel.send(formattedMessage);
        } catch (error) {
            console.error('Failed to relay message to Discord:', error);
        }
    }
}

function initializeRelay() {
    return new MessageRelay();
}

module.exports = { initializeRelay }; 
const DISCORD_EMOJI = '<:discord_logo:YOUR_EMOJI_ID>';  // Replace with your emoji ID
const TELEGRAM_EMOJI = '<:telegram_logo:YOUR_EMOJI_ID>';  // Replace with your emoji ID

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
            
            console.log('Attempting to relay to Telegram:', {
                guildId: message.guildId,
                channelId: message.channelId,
                channelName: message.channel.name
            });

            // Find mapping based on Discord server and channel
            const mapping = this.mappings.find(m => 
                m.discord.serverId === message.guildId &&
                m.discord.channels.some(ch => 
                    ch.id === message.channelId &&
                    ch.name === message.channel.name
                )
            );

            if (!mapping) {
                console.log('No mapping found for Discord message:', {
                    guildId: message.guildId,
                    channelId: message.channelId,
                    availableMappings: this.mappings.map(m => ({
                        serverId: m.discord.serverId,
                        channels: m.discord.channels
                    }))
                });
                return;
            }

            // Find the corresponding Telegram chat
            const discordChannel = mapping.discord.channels.find(ch => 
                ch.id === message.channelId
            );
            
            const telegramChat = mapping.telegram.channels.find(ch =>
                ch.name === discordChannel.mappedTo
            );

            if (!telegramChat) {
                console.log('No matching Telegram chat found:', {
                    discordChannel,
                    availableTelegramChannels: mapping.telegram.channels
                });
                return;
            }

            console.log('Sending to Telegram:', {
                chatId: telegramChat.id,
                message: `[DS] | ${message.author.tag}: ${message.content}`
            });

            const formattedMessage = `[DS] | ${message.author.tag}: ${message.content}`;
            await this.telegramBot.api.sendMessage(telegramChat.id, formattedMessage);
        } catch (error) {
            console.error('Failed to relay message to Telegram:', error);
        }
    }

    async relayToDiscord(message) {
        try {
            if (!this.discordBot) throw new Error('Discord bot not initialized');
            
            console.log('Attempting to relay to Discord:', {
                chatId: message.chat.id,
                messageType: message.chat.type
            });

            // Find mapping based on Telegram group ID
            const mapping = this.mappings.find(m => 
                m.telegram.groupId === message.chat.id.toString() &&
                m.telegram.channels.some(ch => ch.id === message.chat.id.toString())
            );

            if (!mapping) {
                console.log('No mapping found for Telegram message:', {
                    chatId: message.chat.id,
                    availableMappings: this.mappings.map(m => ({
                        groupId: m.telegram.groupId,
                        channels: m.telegram.channels
                    }))
                });
                return;
            }

            // Find the corresponding Discord channel
            const telegramChannel = mapping.telegram.channels.find(ch => 
                ch.id === message.chat.id.toString()
            );
            
            if (!telegramChannel) {
                console.log('No telegram channel configuration found:', {
                    chatId: message.chat.id,
                    availableChannels: mapping.telegram.channels
                });
                return;
            }

            const discordChannel = mapping.discord.channels.find(ch =>
                ch.mappedTo === telegramChannel.name
            );

            if (!discordChannel) {
                console.log('No mapped Discord channel found:', {
                    telegramChannel,
                    availableDiscordChannels: mapping.discord.channels
                });
                return;
            }

            console.log('Sending to Discord:', {
                channelId: discordChannel.id,
                message: `[TG] | ${message.from.username || message.from.first_name}: ${message.text}`
            });

            const channel = await this.discordBot.channels.fetch(discordChannel.id);
            await channel.send(`[TG] | ${message.from.username || message.from.first_name}: ${message.text}`);
        } catch (error) {
            console.error('Failed to relay message to Discord:', error);
            if (error.code === 50035) {
                console.error('Channel ID lookup failed. Current mapping:', this.mappings);
            }
        }
    }

    validateMappings() {
        if (!Array.isArray(this.mappings)) {
            throw new Error('Mappings must be an array');
        }

        this.mappings.forEach((mapping, index) => {
            // Validate basic structure
            if (!mapping.name) {
                throw new Error(`Mapping at index ${index} missing name`);
            }
            if (!mapping.discord) {
                throw new Error(`Mapping "${mapping.name}" missing discord configuration`);
            }
            if (!mapping.telegram) {
                throw new Error(`Mapping "${mapping.name}" missing telegram configuration`);
            }

            // Validate Discord config
            if (!mapping.discord.serverId) {
                throw new Error(`Mapping "${mapping.name}" missing discord.serverId`);
            }
            if (!Array.isArray(mapping.discord.channels)) {
                throw new Error(`Mapping "${mapping.name}" discord.channels must be an array`);
            }

            // Validate Discord channels
            mapping.discord.channels.forEach((channel, channelIndex) => {
                if (!channel.id) {
                    throw new Error(`Mapping "${mapping.name}" discord channel ${channelIndex} missing id`);
                }
                if (!channel.name) {
                    throw new Error(`Mapping "${mapping.name}" discord channel ${channelIndex} missing name`);
                }
                if (!channel.mappedTo) {
                    throw new Error(`Mapping "${mapping.name}" discord channel ${channelIndex} missing mappedTo`);
                }
            });

            // Validate Telegram config
            if (!mapping.telegram.groupId) {
                throw new Error(`Mapping "${mapping.name}" missing telegram.groupId`);
            }
            if (!Array.isArray(mapping.telegram.channels)) {
                throw new Error(`Mapping "${mapping.name}" telegram.channels must be an array`);
            }

            // Validate Telegram channels
            mapping.telegram.channels.forEach((channel, channelIndex) => {
                if (!channel.id) {
                    throw new Error(`Mapping "${mapping.name}" telegram channel ${channelIndex} missing id`);
                }
                if (!channel.name) {
                    throw new Error(`Mapping "${mapping.name}" telegram channel ${channelIndex} missing name`);
                }
                if (!channel.type) {
                    throw new Error(`Mapping "${mapping.name}" telegram channel ${channelIndex} missing type`);
                }
            });

            // Validate mappings match
            const discordMappedTo = mapping.discord.channels.map(ch => ch.mappedTo);
            const telegramNames = mapping.telegram.channels.map(ch => ch.name);
            
            discordMappedTo.forEach(mappedName => {
                if (!telegramNames.includes(mappedName)) {
                    throw new Error(`Mapping "${mapping.name}" discord mappedTo "${mappedName}" has no matching telegram channel`);
                }
            });
        });

        console.log('Channel mappings validation successful');
        console.log('Current mappings:', JSON.stringify(this.mappings, null, 2));
    }
}

function initializeRelay() {
    try {
        let relay;
        // First try to read from file
        try {
            const bridges = require('../config/channels.json').bridges;
            relay = new MessageRelay(bridges);
        } catch (error) {
            // If file doesn't exist, try environment variable
            if (process.env.CHANNEL_MAPPINGS) {
                const bridges = JSON.parse(process.env.CHANNEL_MAPPINGS).bridges;
                relay = new MessageRelay(bridges);
            } else {
                console.error('Error loading channel configuration:', error);
                console.log('Please either create config/channels.json or set CHANNEL_MAPPINGS environment variable');
                process.exit(1);
            }
        }

        // Validate mappings after initialization
        try {
            relay.validateMappings();
        } catch (error) {
            console.error('Mapping validation failed:', error.message);
            console.error('Please check your channel mappings configuration');
            process.exit(1);
        }

        return relay;
    } catch (error) {
        console.error('Error initializing relay:', error);
        process.exit(1);
    }
}

module.exports = { initializeRelay }; 
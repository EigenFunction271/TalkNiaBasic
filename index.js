require('dotenv').config();
const express = require('express');
const { startDiscordBot } = require('./src/discordBot');
const { startTelegramBot } = require('./src/telegramBot');
const { initializeRelay } = require('./src/messageRelay');
const fs = require('fs').promises;
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Add JSON body parser
app.use(express.json());

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

// Get all mappings
app.get('/mappings', (req, res) => {
  const mappings = require('./config/mappings.json').mappings;
  res.json({
    count: mappings.length,
    mappings: mappings.map(m => ({
      name: m.name,
      discord: {
        channelId: m.discord.channelId,
      },
      telegram: {
        groupId: m.telegram.groupId
      }
    }))
  });
});

// Add new mapping
app.post('/mappings', async (req, res) => {
  try {
    const { name, discord, telegram } = req.body;
    
    // Validate required fields
    if (!name || !discord?.channelId || !telegram?.groupId) {
      return res.status(400).json({ 
        error: 'Missing required fields. Need: name, discord.channelId, telegram.groupId' 
      });
    }

    const configPath = path.join(__dirname, 'config', 'mappings.json');
    const config = require(configPath);
    
    // Check for duplicate mappings
    const isDuplicate = config.mappings.some(m => 
      m.discord.channelId === discord.channelId || 
      m.telegram.groupId === telegram.groupId
    );

    if (isDuplicate) {
      return res.status(400).json({ error: 'Channel or group already mapped' });
    }

    // Add new mapping
    config.mappings.push({
      name,
      discord: {
        serverId: discord.serverId || '',
        channelId: discord.channelId
      },
      telegram: {
        groupId: telegram.groupId
      }
    });

    // Save updated config
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    // Reload relay with new mappings
    const relay = initializeRelay();
    
    res.json({ message: 'Mapping added successfully', mapping: req.body });
  } catch (error) {
    console.error('Error adding mapping:', error);
    res.status(500).json({ error: 'Failed to add mapping' });
  }
});

// Delete mapping
app.delete('/mappings/:name', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config', 'mappings.json');
    const config = require(configPath);
    
    const initialLength = config.mappings.length;
    config.mappings = config.mappings.filter(m => m.name !== req.params.name);
    
    if (config.mappings.length === initialLength) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    // Save updated config
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    // Reload relay with new mappings
    const relay = initializeRelay();
    
    res.json({ message: 'Mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting mapping:', error);
    res.status(500).json({ error: 'Failed to delete mapping' });
  }
});

// Add mapping with channel specification
app.post('/mappings/channels', async (req, res) => {
  try {
    const { name, discord, telegram } = req.body;
    
    // Validate required fields
    if (!name || !discord?.serverId || !telegram?.groupId) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Validate channel mappings
    if (!discord.channels || !telegram.channels) {
      return res.status(400).json({
        error: 'Channel mappings are required'
      });
    }

    const configPath = path.join(__dirname, 'config', 'mappings.json');
    const config = require(configPath);
    
    // Add new mapping with channel specifications
    config.mappings.push({
      name,
      discord: {
        serverId: discord.serverId,
        serverName: discord.serverName,
        channels: discord.channels
      },
      telegram: {
        groupId: telegram.groupId,
        groupName: telegram.groupName,
        channels: telegram.channels
      }
    });

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    res.json({ 
      message: 'Channel mapping added successfully', 
      mapping: req.body 
    });
  } catch (error) {
    console.error('Error adding channel mapping:', error);
    res.status(500).json({ error: 'Failed to add mapping' });
  }
});

let discordBot = null;

// Start Express server first
const server = app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
  // Then start the bot
  startBridge().catch(error => {
    console.error('Failed to start bridge:', error);
    process.exit(1);
  });
});

async function startBridge() {
    try {
        const relay = initializeRelay();
        discordBot = await startDiscordBot(relay);
        const telegramBot = await startTelegramBot(relay);
        console.log('Messenger Bridge is running!');
    } catch (error) {
        console.error('Failed to start Messenger Bridge:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 
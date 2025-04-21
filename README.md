# TalkNiaBasic - Discord-Telegram Bridge

A flexible message bridge that relays messages between specific Discord and Telegram channels.

## Features

- Bidirectional message relay between Discord and Telegram
- Support for multiple channel-to-channel mappings within servers/groups
- Map specific Discord channels to specific Telegram chats
- Shows sender's username and platform
- Simple REST API for managing mappings
- Basic error handling and logging

## Prerequisites

- Node.js 18.x or higher
- A Discord Bot Token (from Discord Developer Portal)
- A Telegram Bot Token (from BotFather)
- Discord server(s) with designated channels
- Telegram group(s)

## Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd talkniabasic
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure the environment**
   
Create a `.env` file in the root directory with:
```env
DISCORD_TOKEN=your_discord_bot_token
TELEGRAM_TOKEN=your_telegram_bot_token
PORT=3000  # For Render deployment
```

4. **Discord Bot Setup**
   1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
   2. Click "New Application" and name your bot
   3. Go to the "Bot" section in the left sidebar
   4. Click "Add Bot" → "Yes, do it!"
   5. Copy the token and add it to `DISCORD_TOKEN` in `.env`
   6. Enable Message Content Intent:
      - Scroll down to "Privileged Gateway Intents"
      - Toggle ON "Message Content Intent"
      - Save Changes
   7. Generate invite link:
      - Go to "OAuth2" → "URL Generator" in the left sidebar
      - Under "INTEGRATION TYPE", select "Guild Install"
      - Under "Scopes", select `bot`
      - Under "Bot Permissions", select:
        - "Read Messages/View Channels"
        - "Send Messages"
        - "Read Message History"
      - Copy the generated URL
      - Open the URL to invite the bot to your server(s)

5. **Telegram Bot Setup**
   1. Message [@BotFather](https://t.me/botfather) on Telegram
   2. Send `/newbot` command
   3. Choose a name and username
   4. Copy the token to `TELEGRAM_TOKEN` in `.env`
   5. Send `/setprivacy` to @BotFather
   6. Select your bot
   7. Select 'Disable' to allow bot to see all messages
   8. Add the bot to your Telegram group(s)

6. **Create Initial Configuration**

Create `config/mappings.json`:
```json
{
  "mappings": []
}
```

## Channel Mapping Setup

### 1. Gathering Required IDs

#### Discord IDs
1. **Enable Developer Mode**:
   - Open Discord
   - Go to Settings → App Settings → Advanced
   - Toggle ON "Developer Mode"

2. **Get Server ID**:
   - Right-click your server name
   - Click "Copy Server ID"
   - Save this ID - it's your `serverId`

3. **Get Channel IDs**:
   - Right-click the channel you want to bridge
   - Click "Copy Channel ID"
   - Save this ID - it's your `channelId`
   - Note: Write down the exact channel name as it appears in Discord

#### Telegram IDs
1. **Get Group ID**:
   - Add your bot to the Telegram group
   - Send any message in the group
   - Visit: `https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates`
   - Replace [YOUR_BOT_TOKEN] with your actual bot token
   - Look for: `"chat":{"id": -XXXXXXXXXX}`
   - Save this number (including the minus sign) - it's your `groupId`

### 2. Creating the Channel Mappings

Create a JSON structure with your gathered IDs. Here's a template with real examples:

```json
{
  "bridges": [
    {
      "name": "Main Bridge",
      "discord": {
        "serverId": "1250317952612565050",
        "serverName": "Your Server Name",
        "channels": [
          {
            "id": "1250317952612565050",
            "name": "general",
            "mappedTo": "main-chat"
          }
        ]
      },
      "telegram": {
        "groupId": "-1002231684175",
        "groupName": "Your Group Name",
        "channels": [
          {
            "id": "-1002231684175",
            "name": "main-chat",
            "type": "group"
          }
        ]
      }
    }
  ]
}
```

### 3. Adding the Mapping to Render

1. **Format the JSON**:
   - Copy your JSON structure
   - Remove all line breaks and extra spaces
   - It should be a single line

2. **Add to Render**:
   - Go to your service in Render Dashboard
   - Click "Environment"
   - Add new variable:
     - Key: `CHANNEL_MAPPINGS`
     - Value: Your single-line JSON

Example single-line format:
```json
{"bridges":[{"name":"Main Bridge","discord":{"serverId":"1250317952612565050","serverName":"Your Server Name","channels":[{"id":"1250317952612565050","name":"general","mappedTo":"main-chat"}]},"telegram":{"groupId":"-1002231684175","groupName":"Your Group Name","channels":[{"id":"-1002231684175","name":"main-chat","type":"group"}]}}]}
```

### 4. Verifying the Setup

1. **Check Render Logs**:
   - Go to your service dashboard
   - Click "Logs"
   - Look for "Messenger Bridge is running!"
   - There should be no errors about channel configuration

2. **Test the Bridge**:
   - Send a message in your Discord channel
   - It should appear in the Telegram group
   - Send a message in the Telegram group
   - It should appear in the Discord channel

### 5. Adding More Channels

To add more channels to an existing bridge:

1. **Add New Discord Channel**:
   - Get the new channel's ID
   - Add to the `channels` array in Discord section:
   ```json
   "channels": [
     {
       "id": "1250317952612565050",
       "name": "general",
       "mappedTo": "main-chat"
     },
     {
       "id": "NEW_CHANNEL_ID",
       "name": "announcements",
       "mappedTo": "announcements"
     }
   ]
   ```

2. **Add New Telegram Group**:
   - Get the new group's ID
   - Add to the `channels` array in Telegram section:
   ```json
   "channels": [
     {
       "id": "-1002231684175",
       "name": "main-chat",
       "type": "group"
     },
     {
       "id": "NEW_GROUP_ID",
       "name": "announcements",
       "type": "group"
     }
   ]
   ```

3. **Update Render**:
   - Format the new JSON as a single line
   - Update the `CHANNEL_MAPPINGS` environment variable
   - Redeploy your service

### 6. Troubleshooting

1. **Messages Not Being Relayed**:
   - Verify all IDs are correct
   - Check channel names match exactly
   - Ensure `mappedTo` values correspond correctly
   - Confirm bot has proper permissions in both platforms

2. **JSON Errors**:
   - Validate your JSON structure at [jsonlint.com](https://jsonlint.com)
   - Ensure all IDs are strings (wrapped in quotes)
   - Check for missing commas or brackets

3. **Bot Access Issues**:
   - Discord: Ensure bot has "View Channel" and "Send Messages" permissions
   - Telegram: Verify bot is admin in the group with message permissions

## Deployment on Render

1. Push your code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Configure:
   - Name: "discord-telegram-bot"
   - Environment: "Node"
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables:
     - `DISCORD_TOKEN`
     - `TELEGRAM_TOKEN`
     - `PORT`

## Troubleshooting

1. **Messages not being relayed**:
   - Verify channel names match exactly in mappings
   - Check `mappedTo` fields are correct
   - Ensure bot has access to all channels
   - Check Discord Message Content Intent
   - Verify Telegram privacy mode is disabled

2. **Channel mapping issues**:
   - Confirm all IDs are correct
   - Check JSON format in mappings
   - Verify channel names match exactly
   - Ensure unique `mappedTo` values

3. **API errors**:
   - Check all required fields in requests
   - Verify JSON formatting
   - Ensure unique mapping names
   - Check server logs for details

## Health Checks

- Basic check: `GET /`
- Detailed status: `GET /health`
- View mappings: `GET /mappings`

## Running the Bot

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Project Structure

```
talkniabasic/
├── src/
│   ├── discordBot.js    # Discord bot implementation
│   ├── telegramBot.js   # Telegram bot implementation
│   └── messageRelay.js  # Message relay logic
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── index.js            # Application entry point
├── package.json        # Project dependencies
└── README.md           # This file
```

## Message Flow

```
Discord Channel → Discord Bot → Message Relay → Telegram Bot → Telegram Group
Telegram Group → Telegram Bot → Message Relay → Discord Bot → Discord Channel
```

## Error Handling

The bot will:
- Log errors to console
- Continue operating after non-critical errors
- Exit with status code 1 on critical startup errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Security Setup

For security, sensitive files are not committed to Git. You'll need to:

1. Copy the example files:
```bash
cp config/channels.example.json config/channels.json
cp .env.example .env
```

2. Edit `.env` with your tokens:
```env
DISCORD_TOKEN=your_discord_bot_token    # From Discord Developer Portal
TELEGRAM_TOKEN=your_telegram_bot_token  # From BotFather
PORT=3000
```

3. Edit `config/channels.json` with your channel mappings

⚠️ IMPORTANT: Never commit `.env` or `channels.json` to Git!

## Security Notes

To keep your bot secure:
1. Keep your bot tokens private
2. Don't share your `channels.json` file
3. Don't commit sensitive files to Git
4. Use environment variables for tokens
5. Keep your bot's permissions minimal:
   - Discord: Only request necessary permissions
   - Telegram: Only add bot to groups it needs to be in

## Deployment

### Local Deployment
- Bot runs only while your computer is on and the script is running
- Stops when you close the terminal or shut down
- Good for testing and development

### Free Tier Deployment Options

1. **Oracle Cloud Free Tier** (Most Generous):
   - Always Free tier includes:
     - 2 AMD-based Compute VMs
     - 24GB total memory
     - Never expires
   - Setup steps:
     1. Create Oracle Cloud account
     2. Launch an "Always Free" VM (Ubuntu recommended)
     3. Install Node.js
     4. Clone your repository
     5. Run with PM2

2. **Google Cloud Free Tier**:
   - e2-micro instance (2 shared vCPU, 1GB RAM)
   - Available for 90 days
   - Setup via Google Cloud Shell:
     ```bash
     # Create a VM
     gcloud compute instances create discord-telegram-bot \
       --machine-type=e2-micro \
       --zone=us-central1-a
     ```

3. **Railway.app**:
   - 500 hours free per month
   - 512MB RAM
   - Simple GitHub integration
   - Steps:
     1. Connect GitHub repository
     2. Add environment variables
     3. Deploy automatically

4. **Render.com**:
   - Free tier includes:
     - 750 hours free per month
     - Automatic deploys from Git
     - Sleep after 15 minutes of inactivity
   - Good for hobby projects

5. **Fly.io**:
   - Generous free tier:
     - 3 shared-cpu-1x 256mb VMs
     - 160GB outbound data transfer
   - Simple deployment:
     ```bash
     # Install flyctl
     curl -L https://fly.io/install.sh | sh
     
     # Deploy
     fly launch
     fly deploy
     ```

For beginners, I recommend Oracle Cloud Free Tier because:
- Never expires
- Most generous resources
- Full VM access
- No credit card required for free resources

### Oracle Cloud Deployment Guide

1. **Create Oracle Cloud Account**:
   - Go to [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
   - Click "Start for free"
   - Complete registration (no credit card required)
   - Verify your email

2. **Create VM Instance**:
   - Login to Oracle Cloud Console
   - Go to Menu → Compute → Instances
   - Click "Create Instance"
   - Name your instance (e.g., "discord-telegram-bot")
   - Under "Image and shape":
     - Select "Ubuntu 22.04" as the operating system
     - Choose "VM.Standard.A1.Flex" (ARM-based) or "VM.Standard.E2.1.Micro" (x86)
     - For RAM and OCPU, stay within Always Free limits
   - Under "Networking":
     - Create new VCN (or use existing)
     - Create new subnet (or use existing)
   - Under "Add SSH keys":
     - Choose "Generate a key pair for me"
     - Download the private key file (.key)
   - Click "Create"

3. **Connect to Your Instance**:
   - Save the downloaded private key as `oracle.key`
   - On Windows:
     ```bash
     # Convert key permissions (in Git Bash or WSL)
     chmod 400 oracle.key
     
     # Connect (replace with your instance's public IP)
     ssh -i oracle.key ubuntu@<YOUR_INSTANCE_IP>
     ```
   - On Mac/Linux:
     ```bash
     chmod 400 oracle.key
     ssh -i oracle.key ubuntu@<YOUR_INSTANCE_IP>
     ```

4. **Setup Environment**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Create project directory
   mkdir discord-telegram-bot
   cd discord-telegram-bot
   ```

5. **Deploy Your Bot**:
   ```bash
   # Clone your repository
   git clone <your-repo-url> .

   # Install dependencies
   npm install

   # Create .env file
   nano .env
   ```

   Add your environment variables:
   ```env
   DISCORD_TOKEN=your_discord_token
   DISCORD_CHANNEL_ID=your_channel_id
   TELEGRAM_TOKEN=your_telegram_token
   TELEGRAM_GROUP_ID=your_group_id
   ```

6. **Start the Bot**:
   ```bash
   # Start with PM2
   pm2 start index.js --name "discord-telegram-bot"

   # Save PM2 configuration
   pm2 save

   # Setup PM2 to start on system reboot
   pm2 startup
   # Run the command that PM2 outputs
   ```

7. **Monitor Your Bot**:
   ```bash
   # Check status
   pm2 status

   # View logs
   pm2 logs discord-telegram-bot

   # Monitor resources
   pm2 monit
   ```

8. **Security Tips**:
   - Update the security list for your VCN:
     - Go to Networking → Virtual Cloud Networks
     - Click your VCN
     - Click your subnet's security list
     - Add ingress rules only for necessary ports

9. **Troubleshooting**:
   - Check logs: `pm2 logs`
   - Restart bot: `pm2 restart discord-telegram-bot`
   - Check system resources: `htop` (install with `sudo apt install htop`)
   - Check Node.js version: `node --version`

### Render.com Deployment Guide

1. **Prepare Your Repository**:
   - Push your code to a GitHub repository
   - Make sure your repository includes:
     ```
     talkniabasic/
     ├── src/
     ├── index.js
     ├── package.json
     └── .gitignore
     ```
   - Add a `start` script in package.json:
     ```json
     {
       "scripts": {
         "start": "node index.js"
       }
     }
     ```

2. **Sign Up for Render**:
   - Go to [render.com](https://render.com)
   - Click "Sign Up"
   - Choose "Sign up with GitHub"
   - Authorize Render to access your repositories

3. **Create New Web Service**:
   - Click "New +"
   - Select "Web Service"
   - Choose your repository
   - Configure service:
     - Name: "discord-telegram-bot" (or your preference)
     - Environment: "Node"
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Instance Type: "Free"

4. **Set Environment Variables**:
   - Scroll down to "Environment Variables"
   - Add each variable from your `.env` file:
     ```
     DISCORD_TOKEN=your_discord_token
     DISCORD_CHANNEL_ID=your_channel_id
     TELEGRAM_TOKEN=your_telegram_token
     TELEGRAM_GROUP_ID=your_group_id
     ```
   - Click "Save Changes"

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the initial deployment to complete

6. **Monitor Your Deployment**:
   - View logs in the "Logs" tab
   - Check deployment status in "Events"
   - Monitor resource usage in "Metrics"

7. **Important Notes**:
   - Free tier limitations:
     - Service sleeps after 15 minutes of inactivity
     - 750 hours per month of runtime
     - Automatic HTTPS
     - Automatic deploys on git push
   - To prevent sleeping:
     - Add a simple health check endpoint to your bot
     - Use an uptime monitoring service (like UptimeRobot)

8. **Troubleshooting**:
   - Check "Logs" for any errors
   - Verify environment variables are set correctly
   - Ensure start command matches your package.json
   - Check if the service is in "sleep" mode

9. **Keep Bot Active (Optional)**:
   Add this code to your `index.js` to create a basic web server:
   ```javascript
   const express = require('express');
   const app = express();
   const port = process.env.PORT || 3000;

   app.get('/', (req, res) => {
     res.send('Bot is running!');
   });

   app.listen(port, () => {
     console.log(`Web server running on port ${port}`);
   });
   ```
   
   Add Express to your dependencies:
   ```bash
   npm install express
   ```

## Easy Channel Setup

Instead of using API endpoints, you can directly edit the `config/channels.json` file:

1. Create `config/channels.json` if it doesn't exist
2. Copy this template:
```json
{
  "bridges": [
    {
      "name": "General Chat Bridge",
      "discord": {
        "serverId": "YOUR_DISCORD_SERVER_ID",
        "serverName": "Your Server Name",
        "channels": [
          {
            "id": "YOUR_DISCORD_CHANNEL_ID",
            "name": "general",
            "mappedTo": "main-chat"
          }
        ]
      },
      "telegram": {
        "groupId": "YOUR_TELEGRAM_GROUP_ID",
        "groupName": "Your Telegram Group",
        "channels": [
          {
            "id": "YOUR_TELEGRAM_CHAT_ID",
            "name": "main-chat",
            "type": "group"
          }
        ]
      }
    }
  ]
}
```

3. Replace the placeholder values:
   - `YOUR_DISCORD_SERVER_ID`: Right-click your Discord server → Copy Server ID
   - `YOUR_DISCORD_CHANNEL_ID`: Right-click the Discord channel → Copy ID
   - `YOUR_TELEGRAM_GROUP_ID`: Get from bot API or group info (include the minus sign)
   - `YOUR_TELEGRAM_CHAT_ID`: Same as group ID for single-channel groups

4. You can add multiple bridges by adding more objects to the `bridges` array

Example with real values:
```json
{
  "bridges": [
    {
      "name": "Gaming Chat",
      "discord": {
        "serverId": "123456789012345678",
        "serverName": "Gaming Server",
        "channels": [
          {
            "id": "123456789012345678",
            "name": "general",
            "mappedTo": "main-chat"
          }
        ]
      },
      "telegram": {
        "groupId": "-1001234567890",
        "groupName": "Gaming Group",
        "channels": [
          {
            "id": "-1001234567890",
            "name": "main-chat",
            "type": "group"
          }
        ]
      }
    }
  ]
}
```

The bot will automatically load any changes to this file when it starts up.

## Render Deployment Notes

For channel mappings on Render, you have two options:

1. **Manual Setup (Recommended for beginners)**:
   ```bash
   # In Render Shell
   mkdir -p config
   nano config/channels.json
   # Paste your configuration
   ```

2. **Environment Variable Setup**:
   - Go to your service Dashboard
   - Add Environment Variable:
     - Key: `CHANNEL_MAPPINGS`
     - Value: Your entire channels.json content (as a single line)
   
Note: Any changes to channel mappings will require either:
- Using Render's Shell to edit config/channels.json
- Updating the CHANNEL_MAPPINGS environment variable
- Redeploying the service 

## Managing Channel Mappings on Render

### Option 1: Environment Variable Setup (Recommended)

1. **Prepare Your Mappings**:
   ```bash
   # Run the management script
   npm run manage-mappings
   ```
   This will:
   - Read your existing mappings
   - Format them for Render
   - Save a backup
   - Show you the value to copy

2. **Add to Render**:
   1. Go to your Render Dashboard
   2. Select your service
   3. Click "Environment"
   4. Add new variable:
      - Key: `CHANNEL_MAPPINGS`
      - Value: Paste the entire output from the script
   5. Click "Save Changes"

3. **Update Mappings Later**:
   1. Edit your local `config/channels.json`
   2. Run `npm run manage-mappings` again
   3. Copy the new value
   4. Update the environment variable in Render
   5. Redeploy your service

Example environment variable format:
```json
{"bridges":[{"name":"Gaming Chat","discord":{"serverId":"123456789012345678","serverName":"Gaming Server","channels":[{"id":"123456789012345678","name":"general","mappedTo":"main-chat"}]},"telegram":{"groupId":"-1001234567890","groupName":"Gaming Group","channels":[{"id":"-1001234567890","name":"main-chat","type":"group"}]}}]}
```

### Troubleshooting

1. **Invalid JSON Error**:
   - Make sure there are no line breaks in the environment variable
   - Verify all quotes are properly escaped
   - Use the management script to generate the correct format

2. **Mappings Not Working**:
   - Check the Render logs for any JSON parsing errors
   - Verify the environment variable is saved properly
   - Make sure you've redeployed after changes

3. **Changes Not Taking Effect**:
   - Remember to redeploy your service after updating the environment variable
   - Check the logs to ensure the new configuration is loaded

### Security Notes

The environment variable approach is more secure because:
1. Configuration is stored in Render's encrypted environment
2. No sensitive data in files
3. Access controlled through Render's dashboard
4. Changes are logged and tracked

### Backup and Recovery

The management script automatically creates backups:
- Located in `config/mappings-[timestamp].txt`
- Contains full mapping configuration
- Can be used to restore if needed

To restore from backup:
1. Find the backup file in `config/`
2. Copy its contents
3. Update the environment variable in Render
4. Redeploy your service 

## Deployment Cleanup

To clean up old deployments on Render:

1. Get your Render API key:
   - Go to your Render dashboard
   - Click on your profile icon → Account Settings
   - Go to API Keys
   - Create a new API key

2. Get your service ID:
   - Go to your service dashboard
   - The service ID is in the URL: `https://dashboard.render.com/web/srv-XXXXX`
   - Copy the `srv-XXXXX` part

3. Set up environment variables:
   ```bash
   export RENDER_API_KEY=your_api_key
   export RENDER_SERVICE_ID=srv-XXXXX
   ```

4. Run the cleanup script:
   ```bash
   npm run cleanup
   ```

The script will:
- List all deployments
- Identify active deployments
- Keep the most recent active deployment
- Terminate any other active deployments
- Log the cleanup process

You can also add these environment variables to your Render service to run cleanup automatically:
1. Go to your service dashboard
2. Click "Environment"
3. Add the variables:
   - `RENDER_API_KEY`
   - `RENDER_SERVICE_ID` 

## Multiple Server Setup

The bot supports multiple servers and many-to-many connections between Discord and Telegram. Each bridge can contain:
- Multiple Discord channels from different servers
- Multiple Telegram groups/channels
- Complex mappings between them

### Example Configurations

1. **Basic Multi-Server Setup**:
```json
{
  "bridges": [
    {
      "name": "Gaming Bridge",
      "discord": {
        "serverId": "123456789012345678",
        "serverName": "Gaming Server",
        "channels": [
          {
            "id": "123456789012345678",
            "name": "announcements",
            "mappedTo": "gaming-announcements"
          },
          {
            "id": "123456789012345679",
            "name": "general",
            "mappedTo": "gaming-general"
          }
        ]
      },
      "telegram": {
        "groupId": "-1001234567890",
        "groupName": "Gaming Community",
        "channels": [
          {
            "id": "-1001234567890",
            "name": "gaming-announcements",
            "type": "group"
          },
          {
            "id": "-1001234567891",
            "name": "gaming-general",
            "type": "group"
          }
        ]
      }
    },
    {
      "name": "Study Bridge",
      "discord": {
        "serverId": "987654321098765432",
        "serverName": "Study Server",
        "channels": [
          {
            "id": "987654321098765432",
            "name": "homework",
            "mappedTo": "study-help"
          }
        ]
      },
      "telegram": {
        "groupId": "-1009876543210",
        "groupName": "Study Group",
        "channels": [
          {
            "id": "-1009876543210",
            "name": "study-help",
            "type": "group"
          }
        ]
      }
    }
  ]
}
```

2. **Many-to-Many Setup**:
```json
{
  "bridges": [
    {
      "name": "Community Hub",
      "discord": {
        "serverId": "111222333444555666",
        "serverName": "Main Community",
        "channels": [
          {
            "id": "111222333444555666",
            "name": "announcements",
            "mappedTo": "all-announcements"
          },
          {
            "id": "111222333444555667",
            "name": "general",
            "mappedTo": "main-chat"
          }
        ]
      },
      "telegram": {
        "groupId": "-1001112223334",
        "groupName": "Community Groups",
        "channels": [
          {
            "id": "-1001112223334",
            "name": "all-announcements",
            "type": "group"
          },
          {
            "id": "-1001112223335",
            "name": "main-chat",
            "type": "group"
          }
        ]
      }
    }
  ]
}
```

### How Mappings Work

1. **Channel Matching**:
   - Each Discord channel has a `mappedTo` field
   - This matches with a Telegram channel's `name` field
   - Messages are relayed between matched channels

2. **Multiple Servers**:
   - Each bridge can have its own Discord server
   - Use different `serverId` values for each server
   - Keep channel names unique within each bridge

3. **Validation**:
   - The bot validates all mappings on startup
   - Ensures all `mappedTo` values have matching channels
   - Checks for required fields and correct format

### Testing Your Setup

1. **Check Mappings**:
   ```bash
   curl http://your-bot-url/mappings
   ```
   This shows all active mappings.

2. **Debug Endpoint**:
   ```bash
   curl http://your-bot-url/debug
   ```
   Shows connection status and current mappings.

3. **Send Test Messages**:
   - Send a message in each Discord channel
   - Check corresponding Telegram groups
   - Send messages in Telegram groups
   - Verify they appear in Discord

### Troubleshooting Multiple Servers

1. **No Message Relay**:
   - Verify server IDs are correct
   - Check channel names match exactly
   - Ensure `mappedTo` values correspond to Telegram channel names

2. **Wrong Channel Delivery**:
   - Double-check `mappedTo` values
   - Verify channel IDs
   - Check for duplicate channel names

3. **Missing Messages**:
   - Ensure bot has permissions in all servers
   - Verify bot is member of all Telegram groups
   - Check server and channel IDs are strings (in quotes) 

### Adding New Mappings to Existing Setup

You can add new mappings to your existing configuration in several ways:

1. **Using Environment Variables (Recommended for Render)**:
   1. Get your current mappings:
      ```bash
      curl http://your-bot-url/mappings
      ```
   2. Copy the existing `CHANNEL_MAPPINGS` from Render dashboard
   3. Add new bridge to the JSON structure:
      ```json
      {
        "bridges": [
          // ... existing bridges ...
          {
            "name": "New Bridge",
            "discord": {
              "serverId": "YOUR_NEW_SERVER_ID",
              "serverName": "New Server",
              "channels": [
                {
                  "id": "NEW_CHANNEL_ID",
                  "name": "new-channel",
                  "mappedTo": "new-chat"
                }
              ]
            },
            "telegram": {
              "groupId": "NEW_GROUP_ID",
              "groupName": "New Group",
              "channels": [
                {
                  "id": "NEW_GROUP_ID",
                  "name": "new-chat",
                  "type": "group"
                }
              ]
            }
          }
        ]
      }
      ```
   4. Convert to single line (remove all line breaks)
   5. Update `CHANNEL_MAPPINGS` in Render dashboard
   6. Redeploy your service

2. **Adding to Existing Bridge**:
   ```json
   {
     "bridges": [
       {
         "name": "Existing Bridge",
         "discord": {
           "serverId": "EXISTING_SERVER_ID",
           "serverName": "Existing Server",
           "channels": [
             // ... existing channels ...
             {
               "id": "NEW_CHANNEL_ID",
               "name": "another-channel",
               "mappedTo": "another-chat"
             }
           ]
         },
         "telegram": {
           "groupId": "EXISTING_GROUP_ID",
           "groupName": "Existing Group",
           "channels": [
             // ... existing channels ...
             {
               "id": "NEW_CHAT_ID",
               "name": "another-chat",
               "type": "group"
             }
           ]
         }
       }
     ]
   }
   ```

3. **Using the API Endpoint**:
   ```bash
   curl -X POST http://your-bot-url/mappings/channels \
     -H "Content-Type: application/json" \
     -d '{
       "name": "New Bridge",
       "discord": {
         "serverId": "YOUR_NEW_SERVER_ID",
         "serverName": "New Server",
         "channels": [
           {
             "id": "NEW_CHANNEL_ID",
             "name": "new-channel",
             "mappedTo": "new-chat"
           }
         ]
       },
       "telegram": {
         "groupId": "NEW_GROUP_ID",
         "groupName": "New Group",
         "channels": [
           {
             "id": "NEW_GROUP_ID",
             "name": "new-chat",
             "type": "group"
           }
         ]
       }
     }'
   ```

### Validation Steps After Adding Mappings

1. **Check Configuration**:
   ```bash
   curl http://your-bot-url/debug
   ```
   Verify new mappings appear in the response.

2. **Test New Channels**:
   - Send test message in new Discord channel
   - Send test message in new Telegram group
   - Verify messages appear in both directions

3. **Check Logs**:
   - Monitor Render logs for any validation errors
   - Look for successful relay messages
   - Verify channel IDs and names match

### Common Issues When Adding Mappings

1. **Invalid JSON Structure**:
   - Use a JSON validator to check format
   - Ensure all IDs are strings (in quotes)
   - Check for missing commas or brackets

2. **Duplicate Names/IDs**:
   - Each bridge name must be unique
   - Channel IDs must be unique within a bridge
   - `mappedTo` values must match exactly

3. **Permission Issues**:
   - Ensure bot has access to new channels
   - Verify bot is admin in new Telegram groups
   - Check Discord channel permissions

4. **Changes Not Taking Effect**:
   - Clear Render build cache
   - Force redeploy after changes
   - Check logs for validation errors 
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

### 1. Gather Required IDs

1. **Discord IDs**:
   - Enable Developer Mode in Discord Settings → App Settings → Advanced
   - Get Server ID: Right-click server → Copy Server ID
   - Get Channel IDs: Right-click each channel → Copy ID
   - Note down channel names exactly as they appear

2. **Telegram IDs**:
   - Add bot to your group
   - Send a message in each relevant chat
   - Visit: `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`
   - Find:
     - Group ID: "chat": {"id": -XXXXXX}
     - Individual chat IDs if using multiple chats

### 2. Create Channel Mapping

Use the `/mappings/channels` endpoint to create a mapping:

```bash
curl -X POST http://your-render-url/mappings/channels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Community Bridge",
    "discord": {
      "serverId": "123456789",
      "serverName": "My Discord Server",
      "channels": [
        {
          "id": "111111",
          "name": "general",
          "mappedTo": "main-chat"
        },
        {
          "id": "222222",
          "name": "announcements",
          "mappedTo": "announcements"
        }
      ]
    },
    "telegram": {
      "groupId": "-987654321",
      "groupName": "My Telegram Group",
      "channels": [
        {
          "id": "-111111",
          "name": "main-chat",
          "type": "group"
        },
        {
          "id": "-222222",
          "name": "announcements",
          "type": "channel"
        }
      ]
    }
  }'
```

### 3. Managing Mappings

1. **View all mappings**:
```bash
curl http://your-render-url/mappings
```

2. **Delete a mapping**:
```bash
curl -X DELETE http://your-render-url/mappings/Community%20Bridge
```

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
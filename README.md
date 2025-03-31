# TalkNiaBasic - Discord-Telegram Bridge

A simple message bridge that relays messages between Discord and Telegram channels.

## Features

- Bidirectional message relay between Discord and Telegram
- Shows sender's username and platform
- Simple setup with environment variables
- Basic error handling and logging

## Prerequisites

- Node.js 18.x or higher
- A Discord Bot Token (from Discord Developer Portal)
- A Telegram Bot Token (from BotFather)
- A Discord server with a designated channel
- A Telegram group

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
   
Create a `.env` file in the root directory with the following variables:
```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_discord_channel_id
TELEGRAM_TOKEN=your_telegram_bot_token
TELEGRAM_GROUP_ID=your_telegram_group_id
```

4. **Discord Bot Setup**
   1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
   2. Click "New Application" and name your bot
   3. Go to the "Bot" section in the left sidebar
   4. Click "Add Bot" → "Yes, do it!"
   5. Under the bot's username, copy the token and add it to `DISCORD_TOKEN` in `.env`
   6. Enable Message Content Intent:
      - Scroll down to "Privileged Gateway Intents"
      - Toggle ON "Message Content Intent"
      - Save Changes
   7. Generate invite link:
      - Go to "OAuth2" → "URL Generator" in the left sidebar
      - Under "INTEGRATION TYPE", select "Guild Install"
      - Under "Scopes", select:
        - `bot`
      - Under "Bot Permissions", select:
        - "View Channels"
        - "Send Messages"
        - "Read Message History"
      - The URL should be in this format:
        ```
        https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=PERMISSION_NUMBER&scope=bot%20messages.read
        ```
      - If you still can't copy the generated URL:
        1. Go back to the "General Information" page
        2. Copy your "Application ID" (also called Client ID)
        3. Replace YOUR_CLIENT_ID in the URL above with your Application ID
        4. The PERMISSION_NUMBER should be the sum of the permissions you selected (for our case, use: 68608)
      - Paste the final URL into your browser
      - You'll be taken to Discord's server selection page
      - Select the server where you want to add the bot
      - Click "Continue" and then "Authorize"
      - Complete the captcha if prompted
   8. Get Channel ID:
      - Open Discord Settings → "App Settings" → "Advanced"
      - Enable "Developer Mode"
      - Right-click the channel you want to use
      - Click "Copy Channel ID"
      - Add this ID to `DISCORD_CHANNEL_ID` in `.env`

5. **Telegram Bot Setup**
   1. Create the bot:
      - Open Telegram and message [@BotFather](https://t.me/botfather)
      - Send `/newbot` command
      - Choose a name for your bot (this is the display name)
      - Choose a username for your bot (must end in 'bot')
      - BotFather will give you a token - copy it to `TELEGRAM_TOKEN` in `.env`
   
   2. Configure bot settings (required):
      - Send `/setprivacy` to @BotFather
      - Select your bot 
      - Select 'Disable' to allow bot to see all messages
      - Send `/setjoingroups` to @BotFather
      - Select your bot
      - Select 'Enable' to allow your bot to be added to groups
      - Wait a few minutes for these settings to take effect
   
   3. Add bot to your group:
      - Make sure you've waited a few minutes after configuring settings
      - Open your Telegram group
      - Click the group name at the top to open group settings
      - Click 'Add members' or 'Add user'
      - Search for your bot using its username 
      - If the bot doesn't appear in search:
        - Try using the direct link: t.me/[Bot username] (replace with your bot's username)
        - Click the bot's name
        - Click 'Add to Group'
        - Select your group
   
   4. Get the group ID:
      - First method (using getUpdates):
        1. Add the bot to your group
        2. Send a message in the group mentioning the bot (e.g. "Hello @your_bot")
        3. Open this URL in your browser (replace YOUR_BOT_TOKEN):
           ```
           https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
           ```
        4. Look for a response like this:
           ```json
           {
             "ok": true,
             "result": [{
               "message": {
                 "chat": {
                   "id": -123456789,  // This is your group ID
                   "title": "Your Group Name",
                   "type": "group"
                 }
               }
             }]
           }
           ```
        5. Copy the "id" value (including the minus sign if present)
        6. Add this ID to `TELEGRAM_GROUP_ID` in `.env`

      - Alternative method (if getUpdates shows no results):
        1. Add @RawDataBot to your group
        2. The bot will automatically send a message with group info
        3. Look for "Chat ID" in the message
        4. Copy the ID (including the minus sign)
        5. Remove @RawDataBot from your group
        6. Add this ID to `TELEGRAM_GROUP_ID` in `.env`

      Note: If getUpdates shows no data:
      - Make sure you sent a message AFTER adding the bot
      - Try removing and re-adding the bot to the group
      - Try the alternative method with @RawDataBot

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

## Security Notes

The project uses some deprecated packages that are dependencies of node-telegram-bot-api:
- request and request-promise (deprecated but functional)
- har-validator (deprecated but functional)
- uuid v3 (older version, but safe for this use case)

While these packages are deprecated, they are still functional for our basic bot implementation. The bot:
- Only communicates with official Discord and Telegram APIs
- Doesn't expose any web endpoints
- Doesn't process sensitive user data

If you need enhanced security for your use case, consider:
- Using alternative Telegram bot libraries
- Implementing additional security measures
- Regular security audits of dependencies

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
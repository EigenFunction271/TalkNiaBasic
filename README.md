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
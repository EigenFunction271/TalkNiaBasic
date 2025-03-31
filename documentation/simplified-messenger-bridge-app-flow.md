# Simplified Messenger Bridge - App Flow Document

## 1. System Overview

The simplified Messenger Bridge consists of three main components:
- **Discord Bot**: Listens for messages on Discord
- **Telegram Bot**: Listens for messages on Telegram
- **Central Relay**: Connects the two bots and handles message forwarding

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│               │      │               │      │               │
│  Discord      │◄────►│  Central      │◄────►│  Telegram     │
│  Bot          │      │  Relay        │      │  Bot          │
│               │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
        ▲                                             ▲
        │                                             │
        ▼                                             ▼
┌───────────────┐                           ┌───────────────┐
│               │                           │               │
│  Discord      │                           │  Telegram     │
│  Channel      │                           │  Group        │
│               │                           │               │
└───────────────┘                           └───────────────┘
```

## 2. Message Flow

### 2.1 Discord to Telegram
```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│           │    │           │    │           │    │           │
│  Discord  │───►│  Discord  │───►│  Central  │───►│  Telegram │
│  User     │    │  Bot      │    │  Relay    │    │  Bot      │───┐
│           │    │           │    │           │    │           │   │
└───────────┘    └───────────┘    └───────────┘    └───────────┘   │
                                                                    │
                                                                    ▼
                                                         ┌───────────────────┐
                                                         │                   │
                                                         │  "Discord User:   │
                                                         │  Hello everyone!" │
                                                         │                   │
                                                         └───────────────────┘
```

1. User sends a message in Discord channel
2. Discord bot receives the message
3. Central relay formats the message with Discord username
4. Telegram bot sends the formatted message to Telegram group

### 2.2 Telegram to Discord
```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│           │    │           │    │           │    │           │
│  Telegram │───►│  Telegram │───►│  Central  │───►│  Discord  │───┐
│  User     │    │  Bot      │    │  Relay    │    │  Bot      │   │
│           │    │           │    │           │    │           │   │
└───────────┘    └───────────┘    └───────────┘    └───────────┘   │
                                                                    │
                                                                    ▼
                                                         ┌───────────────────┐
                                                         │                   │
                                                         │  "Telegram User:  │
                                                         │  Hello everyone!" │
                                                         │                   │
                                                         └───────────────────┘
```

1. User sends a message in Telegram group
2. Telegram bot receives the message
3. Central relay formats the message with Telegram username
4. Discord bot sends the formatted message to Discord channel

## 3. Application Startup Flow

```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│           │    │           │    │           │    │           │
│  Load     │───►│  Connect  │───►│  Connect  │───►│  Listen   │
│  Config   │    │  Discord  │    │  Telegram │    │  for      │
│           │    │  Bot      │    │  Bot      │    │  Messages │
│           │    │           │    │           │    │           │
└───────────┘    └───────────┘    └───────────┘    └───────────┘
```

1. Application loads configuration from file or environment variables
2. Discord bot connects to Discord API
3. Telegram bot connects to Telegram API
4. Both bots begin listening for messages on their respective platforms

## 4. Error Handling Flow

```
┌───────────┐    ┌───────────┐    ┌───────────┐
│           │    │           │    │           │
│  Error    │───►│  Log      │───►│  Continue │
│  Occurs   │    │  Error    │    │  Operation│
│           │    │           │    │           │
└───────────┘    └───────────┘    └───────────┘
```

1. When an error occurs (connection lost, message send failure)
2. Error is logged to console
3. Application continues operating and attempts to recover

## 5. Implementation Structure

```
project/
├── index.js             # Main entry point
├── config.json          # Configuration file
├── discordBot.js        # Discord bot implementation
├── telegramBot.js       # Telegram bot implementation
├── messageRelay.js      # Central relay logic
└── package.json         # Dependencies
```

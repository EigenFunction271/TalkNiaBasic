# Simplified Messenger Bridge - Schema Design Document

## File-Based Configuration

### config.json
```json
{
  "discord": {
    "token": "DISCORD_BOT_TOKEN",
    "channels": [
      {
        "serverId": "discord_server_id",
        "channelId": "discord_channel_id",
        "channelName": "general"
      }
    ]
  },
  "telegram": {
    "token": "TELEGRAM_BOT_TOKEN",
    "groups": [
      {
        "groupId": "telegram_group_id",
        "groupName": "My Group"
      }
    ]
  },
  "mappings": [
    {
      "discord": {
        "serverId": "discord_server_id",
        "channelId": "discord_channel_id"
      },
      "telegram": {
        "groupId": "telegram_group_id"
      },
      "name": "General Chat Bridge"
    }
  ]
}
```

## In-Memory Data Structures

### Message Format
```javascript
{
  platform: "discord", // or "telegram"
  senderId: "user_id_on_platform",
  senderName: "Username",
  content: "Message text content",
  timestamp: Date.now(),
  originalMessageId: "platform_specific_message_id"
}
```

### Cached User Information
```javascript
{
  "discord:user_id": {
    platform: "discord",
    id: "user_id",
    username: "Discord Username",
    displayName: "Display Name"
  },
  "telegram:user_id": {
    platform: "telegram",
    id: "user_id",
    username: "TelegramUsername",
    displayName: "Telegram Display Name" 
  }
}
```

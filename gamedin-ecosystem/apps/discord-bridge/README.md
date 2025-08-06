# GameDin Discord Bridge

A bridge between Discord and the GameDin ecosystem, enabling command execution and notifications through Discord.

## Features

- Slash command support for Discord interactions
- Webhook integration with Athena's Discord channel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- Discord Server (Guild) ID (optional, for guild-specific commands)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd gamedin-ecosystem/apps/discord-bridge
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file and update with your credentials:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your Discord bot token and other settings.

### Configuration

Required environment variables (`.env`):

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=1341937655050670080
DISCORD_PUBLIC_KEY=212685d1e1d1fe35c1bbe48c2e9325c68862940a8fcca86ba654301a6408c00c
DISCORD_GUILD_ID=your_guild_id_here  # Optional

# Serafina Personality
SERAFINA_NAME=Serafina
SERAFINA_PRESENCE=with the cosmos...
SERAFINA_COLOR=#FF69B4
SERAFINA_AVATAR=https://i.imgur.com/example-serafina-icon.png

# Webhooks
ATHENA_WEBHOOK_URL=your_webhook_url_here

# Environment
NODE_ENV=development
```

## 🛠 Development

1. Create a new file in `src/commands` with the following structure:
   ```typescript
   import { SlashCommandBuilder } from '@discordjs/builders';
   
   export const data = new SlashCommandBuilder()
     .setName('commandname')
     .setDescription('Command description')
     // Add options here
     .toJSON();
   
   export async function execute(interaction) {
     // Command logic here
   }
   
   export default {
     data,
     execute
   };
   ```

2. The command will be automatically registered when the bot starts.

## Logging

Logs are saved in the `logs` directory with daily rotation. Logs are also output to the console in development mode.

## License

Part of the GameDin ecosystem.

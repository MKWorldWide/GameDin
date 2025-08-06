import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../src/utils/logger';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  logger.error('Missing required environment variables. Check DISCORD_TOKEN and DISCORD_CLIENT_ID.');
  process.exit(1);
}

// Initialize REST client
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function deployCommands() {
  try {
    const commands = [];
    const commandsPath = join(__dirname, '../src/commands');
    const commandFiles = readdirSync(commandsPath).filter(file => 
      file.endsWith('.ts') || file.endsWith('.js')
    );

    // Load all command files
    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const { default: command } = await import(filePath);
      
      if ('data' in command && 'execute' in command) {
        commands.push(command.data);
        logger.info(`Loaded command: ${command.data.name}`);
      } else {
        logger.warn(`Skipping command at ${filePath} - missing required properties`);
      }
    }

    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    // Deploy commands
    let data;
    if (DISCORD_GUILD_ID) {
      // Guild-specific commands (instantly available in the specified guild)
      data = await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body: commands },
      ) as any[];
      logger.info(`Successfully reloaded ${data.length} guild (/) commands.`);
    } else {
      // Global commands (can take up to an hour to appear)
      data = await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID),
        { body: commands },
      ) as any[];
      logger.info(`Successfully reloaded ${data.length} global (/) commands.`);
      logger.warn('Note: Global commands can take up to an hour to appear in Discord.');
    }

    logger.info('Successfully deployed all commands!');
  } catch (error) {
    logger.error('Error deploying commands:', error);
    process.exit(1);
  }
}

// Run the deployment
deployCommands();

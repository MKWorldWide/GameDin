import { Client, GatewayIntentBits, Collection, ActivityType } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from './utils/logger.js';

// Load environment variables
config();

// Serafina's configuration
const SERAFINA = {
  name: process.env.SERAFINA_NAME || 'Serafina',
  presence: process.env.SERAFINA_PRESENCE || 'WATCHING over the Nexus',
  color: parseInt(process.env.SERAFINA_COLOR || '0xff69b4', 10),
  avatar: process.env.SERAFINA_AVATAR || '',
  version: '1.0.0'
};

// ASCII Art Banner
const BANNER = `
░██████╗███████╗██████╗  █████╗ ███████╗██╗███╗   ██╗ █████╗ 
██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║████╗  ██║██╔══██╗
╚█████╗ █████╗  ██████╔╝███████║█████╗  ██║██╔██╗ ██║███████║
 ╚═══██╗██╔══╝  ██╔══██╗██╔══██║██╔══╝  ██║██║╚██╗██║██╔══██║
██████╔╝███████╗██║  ██║██║  ██║██║     ██║██║ ╚████║██║  ██║
╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
                                                              
${SERAFINA.name} v${SERAFINA.version} | The voice from the shadows
`;

// Display banner on startup
console.log(BANNER);
logger.info('Initializing Serafina...');

// Get current module path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Command collection
client.commands = new Collection();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const { default: command } = await import(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    logger.info(`Loaded command: ${command.data.name}`);
  } else {
    logger.warn(`The command at ${filePath} is missing required "data" or "execute" property.`);
  }
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
  const presenceType = SERAFINA.presence.split(' ')[0].toUpperCase();
  const presenceActivity = SERAFINA.presence.split(' ').slice(1).join(' ');
  
  // Set Serafina's presence
  client.user?.setPresence({
    activities: [{
      name: presenceActivity,
      type: ActivityType[presenceType as keyof typeof ActivityType] || ActivityType.Watching
    }],
    status: 'online'
  });

  // Log successful login
  logger.info(`
    
    🌙 ${SERAFINA.name} is online and watching over the Nexus
    =============================================
    Logged in as: ${client.user?.tag}
    User ID: ${client.user?.id}
    Servers: ${client.guilds.cache.size}
    =============================================
    
  `.replace(/^ +/gm, ''));
});

// Listen for interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
    await interaction.reply({ 
      content: 'There was an error executing this command!', 
      ephemeral: true 
    });
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => {
    logger.info('Successfully authenticated with Discord');
    logger.info(`${SERAFINA.name} is now listening for commands...`);
  })
  .catch(error => {
    logger.error('Failed to authenticate with Discord:', error);
    logger.error('Check your DISCORD_BOT_TOKEN in the .env file');
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Shutting down Discord client...');
  client.destroy();
  process.exit(0);
});

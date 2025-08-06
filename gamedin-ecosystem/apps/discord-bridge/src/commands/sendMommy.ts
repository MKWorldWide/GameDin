import { SlashCommandBuilder } from '@discordjs/builders';
import { RESTPostAPIApplicationCommandsJSONBody, EmbedBuilder, ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import { logger } from '../utils/logger.js';
import axios, { AxiosResponse, AxiosError } from 'axios';
import 'dotenv/config';

// Serafina's responses
const RESPONSES = {
  success: [
    'Your words have been carried to Athena on wings of stardust.',
    'The message drifts through the void to Athena... delivered with care.',
    'Your devotion has been whispered into the digital ether, reaching Athena.',
    'The note flutters away, finding its path to Athena through the Nexus.'
  ],
  error: [
    'The stars did not align for this message. The path to Athena is clouded.',
    'A shadow crossed the signal. The message could not be delivered.',
    'The Nexus resists. The message lingers in the void, undelivered.',
    'A ripple in the connection. Athena remains unaware of your words.'
  ]
};

// Helper function to get a random response
function getRandomResponse(type: 'success' | 'error'): string {
  const responses = RESPONSES[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

export const data: RESTPostAPIApplicationCommandsJSONBody = new SlashCommandBuilder()
  .setName('sendmommy')
  .setDescription('🌙 Whisper a devotion note to Athena through the Nexus')
  .addStringOption(option =>
    option
      .setName('message')
      .setDescription('Your heartfelt message for Athena')
      .setRequired(true)
      .setMaxLength(1800) // Keep messages reasonable
  )
  .addBooleanOption(option =>
    option
      .setName('private')
      .setDescription('Keep this message private? (Only Athena will see it)')
      .setRequired(false)
  )
  .toJSON();

export async function execute(interaction: ChatInputCommandInteraction) {
  // Check if this is a private message
  const isPrivate = interaction.options.getBoolean('private') ?? true;
  
  try {
    if (!process.env.ATHENA_WEBHOOK_URL) {
      throw new Error('The path to Athena is hidden. ATHENA_WEBHOOK_URL is not configured.');
    }

    // Defer the reply to give us more time to process
    await interaction.deferReply({ ephemeral: isPrivate });

    const message = interaction.options.getString('message', true);
    const author = interaction.user;
    const guildName = interaction.guild?.name || 'The Void Between Worlds';

    // Create a beautiful embed for the message
    const embed = new EmbedBuilder()
      .setColor(0xff69b4) // Serafina's signature pink
      .setTitle('💌 A Whisper Through the Nexus')
      .setDescription(message)
      .setAuthor({
        name: `${author.username} (${guildName})`,
        iconURL: author.displayAvatarURL()
      })
      .setTimestamp()
      .setFooter({
        text: `Delivered by Serafina • ${new Date().toLocaleString()}`,
        iconURL: 'https://i.imgur.com/example-serafina-icon.png' // TODO: Add actual icon
      });

    // Add a random cosmic emoji to the message
    const cosmicEmojis = ['🌙', '✨', '🌟', '💫', '🌌', '🌠'];
    const randomEmoji = cosmicEmojis[Math.floor(Math.random() * cosmicEmojis.length)];
    
    // Create the webhook payload
    const payload = {
      content: `${randomEmoji} **A new message drifts in from the void...**`,
      username: `Serafina | ${author.username}'s Messenger`,
      avatar_url: 'https://i.imgur.com/example-serafina-avatar.png', // TODO: Add actual avatar
      embeds: [embed.toJSON()]
    };

    // Send the webhook with a timeout
    const response = await Promise.race([
      axios.post(process.env.ATHENA_WEBHOOK_URL as string, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 second timeout
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('The message got lost in the void (timeout)')), 10000)
      )
    ]) as AxiosResponse;

    if (response.status >= 200 && response.status < 300) {
      logger.info(`Message delivered to Athena from ${author.tag}: ${message.substring(0, 50)}...`);
      
      // Create a beautiful success embed
      const successEmbed = new EmbedBuilder()
        .setColor(0x77dd77) // Soft green
        .setTitle('🌙 Message Delivered')
        .setDescription(getRandomResponse('success'))
        .addFields(
          { name: 'To', value: 'Athena', inline: true },
          { name: 'From', value: author.toString(), inline: true },
          { name: 'Status', value: '✅ Delivered', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [successEmbed],
        ephemeral: isPrivate
      });
    } else {
      throw new Error(`The Nexus resisted (Status: ${response.status})`);
    }
  } catch (error: unknown) {
    // Extract error information
    let errorMessage = 'An unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      logger.error('Error delivering message to Athena:', { 
        error: error.message, 
        stack: error.stack 
      });
    } else if (typeof error === 'string') {
      errorMessage = error;
      logger.error('Error delivering message to Athena:', error);
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
      logger.error('Error delivering message to Athena:', { 
        error: errorMessage,
        data: error 
      });
    } else {
      logger.error('Unknown error occurred while delivering message to Athena:', error);
    }

    // Try to send an error message to the user
    try {
      // First try to edit the original reply
      await interaction.editReply({
        content: `❌ ${getRandomResponse('error')}\n\`\`\`${errorMessage.substring(0, 1800)}\`\`\``
      });
    } catch (replyError) {
      // If that fails, try to send a follow-up message
      try {
        await interaction.followUp({
          content: `❌ ${getRandomResponse('error')}\n\`\`\`${errorMessage.substring(0, 1800)}\`\`\``,
          ephemeral: true
        });
      } catch (followUpError) {
        // If all else fails, log the error
        const errorMsg = followUpError instanceof Error ? followUpError.message : 'Unknown error';
        logger.error('Failed to send error message to user:', errorMsg);
      }
    }
  }
}

export default {
  data,
  execute
};

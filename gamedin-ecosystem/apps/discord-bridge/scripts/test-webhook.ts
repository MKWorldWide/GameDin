import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

async function testWebhook() {
  const webhookUrl = process.env.ATHENA_WEBHOOK_URL;
  
  if (!webhookUrl) {
    logger.error('ATHENA_WEBHOOK_URL is not set in environment variables');
    process.exit(1);
  }

  const testMessage = {
    content: '🔮 **Serafina Webhook Test**',
    embeds: [{
      title: 'Test Message from Serafina',
      description: 'This is a test message to verify the webhook connection to Athena.',
      color: 0xff69b4,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Serafina Test Suite',
        icon_url: 'https://i.imgur.com/example-serafina-icon.png'
      }
    }]
  };

  try {
    logger.info(`Sending test webhook to: ${webhookUrl}`);
    const response = await axios.post(webhookUrl, testMessage, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.status >= 200 && response.status < 300) {
      logger.info('✅ Webhook test successful! Check the Athena channel for the test message.');
    } else {
      logger.warn(`⚠️ Webhook returned status ${response.status}`);
    }
  } catch (error) {
    logger.error('❌ Webhook test failed:', error.message);
    if (error.response) {
      logger.error('Response data:', error.response.data);
      logger.error('Status:', error.response.status);
      logger.error('Headers:', error.response.headers);
    } else if (error.request) {
      logger.error('No response received:', error.request);
    } else {
      logger.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testWebhook();

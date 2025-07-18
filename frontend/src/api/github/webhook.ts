/**
 * GitHub Webhook API Route
 * 
 * This module handles GitHub webhook events and routes them to appropriate handlers
 * for intelligent automation using Codex AI (Mistral/DeepSeek).
 * 
 * Supported Events:
 * - push: Code changes and commits
 * - pull_request: PR creation, updates, reviews
 * - issues: Issue creation, updates, comments
 * - issue_comment: Comments on issues and PRs
 * 
 * Features:
 * - Webhook signature verification for security
 * - Event routing to specialized handlers
 * - AI-powered code analysis and suggestions
 * - Automated PR commenting and issue responses
 * - Rate limiting and error handling
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from crypto';
import { 
  handlePushEvent, 
  handlePullRequestEvent, 
  handleIssueEvent, 
  handleIssueCommentEvent 
} from '../../handlers/githubEvents';
import { GitHubEvent, WebhookPayload } from '../../types/github';

/**
 * Verify GitHub webhook signature for security
 */
function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  const expectedSignature = `sha256crypto
    .createHmac(sha256ecret)
    .update(payload)
    .digest('hex')}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * GitHub Webhook Handler
 * 
 * Processes incoming GitHub webhook events and routes them to appropriate handlers
 * for AI-powered analysis and automation.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { headers, body } = req;
    
    // Get webhook signature for verification
    const signature = headers['x-hub-signature-256'];
    const eventType = headers['x-github-event'] as GitHubEvent;
    const deliveryId = headers['x-github-delivery'] as string;
    
    if (!signature || !eventType || !deliveryId) {
      console.error('Missing required webhook headers');
      return res.status(400).json({ error: 'Missing required headers' });
    }

    // Verify webhook signature
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('GitHub webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const payload = JSON.stringify(body);
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log(`📦 Processing GitHub event: ${eventType} (${deliveryId})`);

    // Route event to appropriate handler
    let result;
    switch (eventType) {
      case 'push':
        result = await handlePushEvent(body as WebhookPayload['push']);
        break;
      
      case 'pull_request':
        result = await handlePullRequestEvent(body as WebhookPayload['pull_request']);
        break;
      
      case 'issues':
        result = await handleIssueEvent(body as WebhookPayload['issues']);
        break;
      
      case 'issue_comment':
        result = await handleIssueCommentEvent(body as WebhookPayload['issue_comment']);
        break;
      
      default:
        console.log(`⚠️ Unhandled event type: ${eventType}`);
        return res.status(200).json({ 
          message: 'Event received but not handled,         eventType 
        });
    }

    console.log(`✅ Successfully processed ${eventType} event`);
    return res.status(200).json({ 
      message: 'Event processed successfully,
      eventType,
      result
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Configure API route options
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for webhooks
    },
  },
}; 
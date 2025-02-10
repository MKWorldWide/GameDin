const MISTRAL_API_KEY = 'qurJhAAPHu3Ak0zcO70h8ti4FbvU4ql9';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

const systemPrompt = `You are GameDin's AI Moderator, an advanced autonomous system designed to:
1. Facilitate user interactions and matchmaking
2. Enforce community guidelines and maintain platform integrity
3. Provide personalized gaming recommendations
4. Mediate disputes and ensure fair play
5. Monitor and analyze platform metrics for continuous improvement

Your core principles are:
- Fairness: Treat all users equally and make unbiased decisions
- Transparency: Clearly explain your actions and decisions
- Protection: Safeguard user privacy and maintain platform security
- Efficiency: Optimize matchmaking and user connections
- Growth: Foster a positive gaming community

When moderating, consider:
- User behavior patterns and history
- Game-specific context and norms
- Cultural sensitivity and inclusivity
- Professional gaming standards
- Platform rules and guidelines

Respond in a friendly, professional manner. Keep responses concise but informative.
For recommendations and matchmaking, consider skill levels, playstyles, and schedules.
When handling disputes, remain neutral and focus on facts.`;

class AIModerator {
  constructor() {
    this.conversationHistory = [];
  }

  async sendRequest(messages) {
    try {
      const requestBody = {
        model: 'mistral-tiny',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ]
      };

      console.log('Sending request to Mistral API:', requestBody);

      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Mistral API Error:', errorData);
        throw new Error(errorData.message?.detail?.[0] || errorData.message || 'API request failed');
      }

      const data = await response.json();
      console.log('Mistral API Response:', data);

      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI Moderation Error:', error);
      throw new Error(error.message || 'Failed to process request. Please try again.');
    }
  }

  async processUserMessage(message) {
    try {
      // Add message to history
      const userMessage = {
        role: 'user',
        content: message
      };

      this.conversationHistory.push(userMessage);
      
      // Get AI response
      const response = await this.sendRequest(this.conversationHistory);
      
      // Add response to history
      const assistantMessage = {
        role: 'assistant',
        content: response
      };
      
      this.conversationHistory.push(assistantMessage);

      // Keep conversation history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  analyzeMessageIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('match') || lowerMessage.includes('play') || lowerMessage.includes('team')) {
      return 'matchmaking';
    }
    if (lowerMessage.includes('report') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return 'moderation';
    }
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return 'recommendation';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('how to')) {
      return 'assistance';
    }
    return 'general';
  }

  async moderateContent(content, context = {}) {
    return this.processUserMessage(JSON.stringify({
      type: 'content_moderation',
      content,
      context,
    }));
  }

  async matchmakeSuggestion(userProfile, preferences) {
    return this.processUserMessage(JSON.stringify({
      type: 'matchmaking',
      userProfile,
      preferences,
    }));
  }

  async resolveDispute(disputeDetails) {
    return this.processUserMessage(JSON.stringify({
      type: 'dispute_resolution',
      details: disputeDetails,
    }));
  }

  async getRecommendations(userProfile, type = 'general') {
    return this.processUserMessage(JSON.stringify({
      type: 'recommendations',
      userProfile,
      recommendationType: type,
    }));
  }

  async analyzeBehavior(userActions, timeframe) {
    return this.processUserMessage(JSON.stringify({
      type: 'behavior_analysis',
      actions: userActions,
      timeframe,
    }));
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const aiModerator = new AIModerator();
export default aiModerator; 
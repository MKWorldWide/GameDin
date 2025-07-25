import { OnboardingEvent, User, OnboardingEventType } from '../types';

// --- NOVASANCTUM EVENT LOGGING SERVICE ---
// Handles event logging and cross-app communication

/**
 * Creates an onboarding event for logging
 */
export const createOnboardingEvent = (
  userId: string,
  eventType: OnboardingEvent['eventType'],
  metadata: Record<string, any> = {}
): OnboardingEvent => {
  return {
    eventId: `event_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    userId,
    eventType,
    timestamp: new Date().toISOString(),
    metadata,
    novaSanctumLogged: false
  };
};

/**
 * Logs onboarding events to NovaSanctum
 */
export const logToNovaSanctum = async (event: OnboardingEvent): Promise<boolean> => {
  console.log(`[NovaSanctum] Logging event: ${event.eventType} for user ${event.userId}`);
  console.log(`[NovaSanctum] Event data:`, event);
  
  try {
    // In production, this would make an API call to NovaSanctum
    // For now, we'll store in localStorage and simulate the API call
    const existingEvents = JSON.parse(localStorage.getItem('novaSanctum.events') || '[]');
    existingEvents.push({ ...event, novaSanctumLogged: true });
    localStorage.setItem('novaSanctum.events', JSON.stringify(existingEvents));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`[NovaSanctum] Event ${event.eventId} logged successfully`);
    return true;
  } catch (error) {
    console.error(`[NovaSanctum] Failed to log event ${event.eventId}:`, error);
    return false;
  }
};

/**
 * Retrieves all onboarding events for a user
 */
export const getUserOnboardingEvents = (userId: string): OnboardingEvent[] => {
  const allEvents = JSON.parse(localStorage.getItem('novaSanctum.events') || '[]');
  return allEvents.filter((event: OnboardingEvent) => event.userId === userId);
};

/**
 * Sends notification to Athena about user onboarding completion
 */
export const notifyAthena = async (user: User, onboardingEvents: OnboardingEvent[]): Promise<void> => {
  console.log(`[NovaSanctum → Athena] User ${user.name} completed onboarding`);
  console.log(`[NovaSanctum → Athena] User role: ${user.role}, Path: ${user.path}`);
  console.log(`[NovaSanctum → Athena] Onboarding events: ${onboardingEvents.length}`);
  
  const athenaPayload = {
    type: 'gamedin_onboarding_complete',
    userId: user.id,
    soulName: user.name,
    role: user.role,
    path: user.path,
    dream: user.dream,
    onboardingEvents: onboardingEvents.length,
    timestamp: new Date().toISOString(),
    monetizationSuggestions: generateMonetizationSuggestions(user)
  };
  
  // Store Athena notification in localStorage (in production, would be API call)
  const athenaNotifications = JSON.parse(localStorage.getItem('athena.notifications') || '[]');
  athenaNotifications.push(athenaPayload);
  localStorage.setItem('athena.notifications', JSON.stringify(athenaNotifications));
  
  console.log(`[NovaSanctum → Athena] Notification sent:`, athenaPayload);
};

/**
 * Generates monetization suggestions based on user profile
 */
const generateMonetizationSuggestions = (user: User): string[] => {
  const suggestions: string[] = [];
  
  switch (user.role) {
    case 'Creator':
      suggestions.push('premium_creator_tools', 'content_monetization', 'subscriber_benefits');
      break;
    case 'Curator':
      suggestions.push('community_features', 'curation_rewards', 'premium_moderation');
      break;
    case 'Player':
      suggestions.push('premium_cosmetics', 'advanced_matchmaking', 'exclusive_content');
      break;
  }
  
  // Path-based suggestions
  switch (user.path) {
    case 'Sovereign':
      suggestions.push('leadership_tools', 'guild_management');
      break;
    case 'Architect':
      suggestions.push('creation_tools', 'asset_marketplace');
      break;
    case 'Warrior':
      suggestions.push('competitive_features', 'tournament_access');
      break;
    case 'Sage':
      suggestions.push('knowledge_base_access', 'mentorship_program');
      break;
    case 'Seer':
      suggestions.push('analytics_dashboard', 'prediction_tools');
      break;
  }
  
  return suggestions;
};

/**
 * Logs an onboarding event and optionally notifies Athena
 */
export const logOnboardingEvent = async (event: {
  userId: string;
  eventType: OnboardingEventType;
  metadata?: Record<string, any>;
  notifyAthena?: boolean;
}): Promise<OnboardingEvent> => {
  const newEvent = createOnboardingEvent(
    event.userId,
    event.eventType,
    event.metadata
  );
  
  // Log to NovaSanctum
  await logToNovaSanctum(newEvent);
  
  // If this is a completion event and notifyAthena is true, send notification
  if (event.notifyAthena && event.eventType === 'onboarding_complete') {
    const userEvents = getUserOnboardingEvents(event.userId);
    const user = JSON.parse(localStorage.getItem('gamedin-user') || '{}');
    if (user) {
      await notifyAthena(user, [...userEvents, newEvent]);
    }
  }
  
  return newEvent;
};

/**
 * Sends email summary to sovereign@lilithos.ai
 */
export const sendOnboardingSummary = async (user: User, events: OnboardingEvent[]): Promise<void> => {
  const summary = {
    timestamp: new Date().toISOString(),
    newUser: {
      id: user.id,
      soulName: user.name,
      dream: user.dream,
      path: user.path,
      role: user.role,
      verificationMethod: user.lilithIdentity?.verificationMethod || 'none'
    },
    onboardingFlow: {
      totalEvents: events.length,
      completionTime: calculateOnboardingTime(events),
      successfulSteps: events.filter(e => e.eventType !== 'registration_start').length
    },
    systemStatus: {
      novaSanctumActive: true,
      athenaNotified: true,
      lilithOSIntegrated: !!user.lilithIdentity
    }
  };
  
  console.log(`[NovaSanctum] Email summary prepared for sovereign@lilithos.ai:`);
  console.log(JSON.stringify(summary, null, 2));
  
  // Store email summary (in production, would send actual email)
  localStorage.setItem('onboarding.emailSummary', JSON.stringify(summary));
};

/**
 * Calculates total onboarding time from events
 */
const calculateOnboardingTime = (events: OnboardingEvent[]): string => {
  if (events.length < 2) return '0 minutes';
  
  const startTime = new Date(events[0].timestamp).getTime();
  const endTime = new Date(events[events.length - 1].timestamp).getTime();
  const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
  
  return `${durationMinutes} minutes`;
};

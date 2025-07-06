/**
 * NovaSanctum AI Service Integration
 *
 * This module provides comprehensive AI integration for the GameDin L3 blockchain,
 * including anti-cheat detection, matchmaking, content generation, and analytics.
 *
 * @author GameDin Development Team
 * @version 4.2.0
 * @since 2024-07-06
 */
import { AIConfig } from '../config/blockchain-config';
export interface AIRequest {
    type: 'antiCheat' | 'matchmaking' | 'contentGeneration' | 'analytics';
    data: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
    timestamp: number;
}
export interface AIResponse {
    success: boolean;
    data: Record<string, unknown>;
    confidence: number;
    latency: number;
    timestamp: number;
}
export interface AntiCheatData {
    playerId: string;
    gameId: string;
    actions: Array<{
        type: string;
        timestamp: number;
        data: Record<string, unknown>;
    }>;
    metrics: {
        responseTime: number;
        accuracy: number;
        consistency: number;
    };
}
export interface MatchmakingData {
    playerId: string;
    preferences: {
        skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
        gameType: string;
        region: string;
        maxWaitTime: number;
    };
    history: Array<{
        gameId: string;
        result: 'win' | 'loss' | 'draw';
        timestamp: number;
    }>;
}
export interface ContentGenerationData {
    type: 'quest' | 'achievement' | 'item' | 'story';
    parameters: {
        difficulty: number;
        theme: string;
        length: 'short' | 'medium' | 'long';
        targetAudience: string;
    };
    context: Record<string, unknown>;
}
export interface AnalyticsData {
    eventType: string;
    userId: string;
    gameId: string;
    metrics: Record<string, number>;
    context: Record<string, unknown>;
}
export declare class NovaSanctumAIService {
    private config;
    private baseUrl;
    private apiKey;
    private isInitialized;
    constructor(config: AIConfig);
    /**
     * Initialize the AI service
     */
    initialize(): Promise<void>;
    /**
     * Send request to AI service
     */
    private sendRequest;
    /**
     * Anti-cheat detection
     */
    detectCheating(data: AntiCheatData): Promise<AIResponse>;
    /**
     * Intelligent matchmaking
     */
    findMatch(data: MatchmakingData): Promise<AIResponse>;
    /**
     * Generate dynamic content
     */
    generateContent(data: ContentGenerationData): Promise<AIResponse>;
    /**
     * Process analytics data
     */
    processAnalytics(data: AnalyticsData): Promise<AIResponse>;
    /**
     * Batch process multiple AI requests
     */
    batchProcess(requests: AIRequest[]): Promise<AIResponse[]>;
    /**
     * Get service status
     */
    getStatus(): {
        initialized: boolean;
        features: Record<string, boolean>;
    };
}
export declare const getNovaSanctumAI: (config?: AIConfig) => NovaSanctumAIService;
export default NovaSanctumAIService;
//# sourceMappingURL=novaSanctumAI.d.ts.map
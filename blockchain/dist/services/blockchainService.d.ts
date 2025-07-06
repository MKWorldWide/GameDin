/**
 * GameDin L3 Blockchain Service
 *
 * This module provides the main blockchain service integration for GameDin L3,
 * combining consensus, gaming features, and AI integration.
 *
 * @author GameDin Development Team
 * @version 4.2.0
 * @since 2024-07-06
 */
import { BlockchainConfig } from '../config/blockchain-config';
import { AIRequest, AIResponse } from './novaSanctumAI';
export interface BlockchainTransaction {
    id: string;
    type: 'gameAction' | 'nftMint' | 'tokenTransfer' | 'consensus' | 'aiRequest';
    data: Record<string, unknown>;
    timestamp: number;
    blockNumber?: number;
    status: 'pending' | 'confirmed' | 'failed';
    gasUsed?: number;
    gasPrice?: string;
}
export interface GamingAction {
    playerId: string;
    gameId: string;
    actionType: string;
    actionData: Record<string, unknown>;
    timestamp: number;
    requiresConsensus: boolean;
}
export interface ConsensusResult {
    success: boolean;
    blockNumber: number;
    validators: number;
    threshold: number;
    latency: number;
    timestamp: number;
}
export declare class GameDinBlockchainService {
    private config;
    private aiService;
    private isInitialized;
    private transactionQueue;
    private consensusValidators;
    constructor(config?: BlockchainConfig);
    /**
     * Initialize the blockchain service
     */
    initialize(): Promise<void>;
    /**
     * Initialize consensus validators
     */
    private initializeValidators;
    /**
     * Process gaming action
     */
    processGamingAction(action: GamingAction): Promise<BlockchainTransaction>;
    /**
     * Process transaction with consensus
     */
    private processWithConsensus;
    /**
     * Process transaction directly (no consensus required)
     */
    private processDirectly;
    /**
     * Run consensus algorithm
     */
    private runConsensus;
    /**
     * Process AI request
     */
    processAIRequest(request: AIRequest): Promise<AIResponse>;
    /**
     * Batch process multiple transactions
     */
    batchProcessTransactions(transactions: BlockchainTransaction[]): Promise<BlockchainTransaction[]>;
    /**
     * Get transaction by ID
     */
    getTransaction(id: string): BlockchainTransaction | undefined;
    /**
     * Get all transactions
     */
    getAllTransactions(): BlockchainTransaction[];
    /**
     * Get pending transactions
     */
    getPendingTransactions(): BlockchainTransaction[];
    /**
     * Get service status
     */
    getStatus(): {
        initialized: boolean;
        config: BlockchainConfig;
        transactionCount: number;
        pendingCount: number;
        aiStatus: {
            initialized: boolean;
            features: Record<string, boolean>;
        };
    };
    /**
     * Generate unique transaction ID
     */
    private generateTransactionId;
    /**
     * Generate block number
     */
    private generateBlockNumber;
    /**
     * Calculate gas used for transaction
     */
    private calculateGasUsed;
}
export declare const getBlockchainService: (config?: BlockchainConfig) => GameDinBlockchainService;
export default GameDinBlockchainService;
//# sourceMappingURL=blockchainService.d.ts.map
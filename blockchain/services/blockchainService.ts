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

import { BlockchainConfig, BlockchainConfigFactory } from '../config/blockchain-config';
import { NovaSanctumAIService, AIRequest, AIResponse } from './novaSanctumAI';

// Blockchain transaction types
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

// Gaming action interface
export interface GamingAction {
  playerId: string;
  gameId: string;
  actionType: string;
  actionData: Record<string, unknown>;
  timestamp: number;
  requiresConsensus: boolean;
}

// Consensus result interface
export interface ConsensusResult {
  success: boolean;
  blockNumber: number;
  validators: number;
  threshold: number;
  latency: number;
  timestamp: number;
}

// Blockchain service class
export class GameDinBlockchainService {
  private config: BlockchainConfig;
  private aiService: NovaSanctumAIService;
  private isInitialized: boolean = false;
  private transactionQueue: BlockchainTransaction[] = [];
  private consensusValidators: Set<string> = new Set();

  constructor(config?: BlockchainConfig) {
    this.config = config || BlockchainConfigFactory.getConfig();
    this.aiService = new NovaSanctumAIService(this.config.ai);
  }

  /**
   * Initialize the blockchain service
   */
  async initialize(): Promise<void> {
    try {
      // Validate configuration
      BlockchainConfigFactory.validateConfig(this.config);

      // Initialize AI service
      await this.aiService.initialize();

      // Initialize consensus validators
      this.initializeValidators();

      this.isInitialized = true;
      console.log('GameDin L3 Blockchain service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Initialize consensus validators
   */
  private initializeValidators(): void {
    // Add default validators based on configuration
    for (let i = 0; i < this.config.consensus.validators; i++) {
      this.consensusValidators.add(`validator-${i}`);
    }
  }

  /**
   * Process gaming action
   */
  async processGamingAction(action: GamingAction): Promise<BlockchainTransaction> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    const transaction: BlockchainTransaction = {
      id: this.generateTransactionId(),
      type: 'gameAction',
      data: {
        playerId: action.playerId,
        gameId: action.gameId,
        actionType: action.actionType,
        actionData: action.actionData,
        requiresConsensus: action.requiresConsensus
      },
      timestamp: Date.now(),
      status: 'pending'
    };

    // Add to transaction queue
    this.transactionQueue.push(transaction);

    // Process based on consensus requirements
    if (action.requiresConsensus) {
      await this.processWithConsensus(transaction);
    } else {
      await this.processDirectly(transaction);
    }

    return transaction;
  }

  /**
   * Process transaction with consensus
   */
  private async processWithConsensus(transaction: BlockchainTransaction): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simulate consensus process
      const consensusResult = await this.runConsensus(transaction);
      
      if (consensusResult.success) {
        transaction.status = 'confirmed';
        transaction.blockNumber = consensusResult.blockNumber;
        transaction.gasUsed = this.calculateGasUsed(transaction);
        transaction.gasPrice = this.config.network.gasPrice;
      } else {
        transaction.status = 'failed';
      }

      console.log(`Consensus completed for transaction ${transaction.id} in ${consensusResult.latency}ms`);
    } catch (error) {
      transaction.status = 'failed';
      console.error('Consensus processing failed:', error);
    }
  }

  /**
   * Process transaction directly (no consensus required)
   */
  private async processDirectly(transaction: BlockchainTransaction): Promise<void> {
    try {
      // Simulate direct processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      transaction.status = 'confirmed';
      transaction.blockNumber = this.generateBlockNumber();
      transaction.gasUsed = this.calculateGasUsed(transaction);
      transaction.gasPrice = this.config.network.gasPrice;
      
      console.log(`Direct processing completed for transaction ${transaction.id}`);
    } catch (error) {
      transaction.status = 'failed';
      console.error('Direct processing failed:', error);
    }
  }

  /**
   * Run consensus algorithm
   */
  private async runConsensus(transaction: BlockchainTransaction): Promise<ConsensusResult> {
    const startTime = Date.now();
    
    // Simulate BFT consensus
    const validators = Array.from(this.consensusValidators);
    const requiredVotes = Math.ceil(validators.length * (this.config.consensus.threshold / 100));
    
    // Simulate validator voting
    const votes = await Promise.all(
      validators.map(async (validator) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        return Math.random() > 0.1; // 90% success rate
      })
    );
    
    const successfulVotes = votes.filter(vote => vote).length;
    const success = successfulVotes >= requiredVotes;
    const latency = Date.now() - startTime;
    
    return {
      success,
      blockNumber: this.generateBlockNumber(),
      validators: validators.length,
      threshold: requiredVotes,
      latency,
      timestamp: Date.now()
    };
  }

  /**
   * Process AI request
   */
  async processAIRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    const transaction: BlockchainTransaction = {
      id: this.generateTransactionId(),
      type: 'aiRequest',
      data: request as unknown as Record<string, unknown>,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.transactionQueue.push(transaction);

    try {
      const response = await this.aiService.batchProcess([request]);
      transaction.status = 'confirmed';
      return response[0];
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }

  /**
   * Batch process multiple transactions
   */
  async batchProcessTransactions(transactions: BlockchainTransaction[]): Promise<BlockchainTransaction[]> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    const results: BlockchainTransaction[] = [];
    
    for (const transaction of transactions) {
      try {
        if (transaction.type === 'aiRequest') {
          const aiRequest = transaction.data as unknown as AIRequest;
          await this.processAIRequest(aiRequest);
        } else {
          await this.processDirectly(transaction);
        }
        results.push(transaction);
      } catch (error) {
        transaction.status = 'failed';
        results.push(transaction);
      }
    }
    
    return results;
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): BlockchainTransaction | undefined {
    return this.transactionQueue.find(tx => tx.id === id);
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): BlockchainTransaction[] {
    return [...this.transactionQueue];
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions(): BlockchainTransaction[] {
    return this.transactionQueue.filter(tx => tx.status === 'pending');
  }

  /**
   * Get service status
   */
  getStatus(): {
    initialized: boolean;
    config: BlockchainConfig;
    transactionCount: number;
    pendingCount: number;
    aiStatus: { initialized: boolean; features: Record<string, boolean> };
  } {
    return {
      initialized: this.isInitialized,
      config: this.config,
      transactionCount: this.transactionQueue.length,
      pendingCount: this.getPendingTransactions().length,
      aiStatus: this.aiService.getStatus()
    };
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate block number
   */
  private generateBlockNumber(): number {
    return Math.floor(Date.now() / this.config.consensus.blockTime);
  }

  /**
   * Calculate gas used for transaction
   */
  private calculateGasUsed(transaction: BlockchainTransaction): number {
    // Simple gas calculation based on transaction type and data size
    const baseGas = 21000;
    const dataSize = JSON.stringify(transaction.data).length;
    const dataGas = dataSize * 16; // 16 gas per byte
    
    switch (transaction.type) {
      case 'gameAction':
        return baseGas + dataGas + 5000;
      case 'aiRequest':
        return baseGas + dataGas + 10000;
      case 'nftMint':
        return baseGas + dataGas + 15000;
      default:
        return baseGas + dataGas;
    }
  }
}

// Export singleton instance
let blockchainServiceInstance: GameDinBlockchainService | null = null;

export const getBlockchainService = (config?: BlockchainConfig): GameDinBlockchainService => {
  if (!blockchainServiceInstance) {
    blockchainServiceInstance = new GameDinBlockchainService(config);
  }
  
  return blockchainServiceInstance;
};

export default GameDinBlockchainService; 
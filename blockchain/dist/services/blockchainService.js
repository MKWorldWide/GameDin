"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockchainService = exports.GameDinBlockchainService = void 0;
const blockchain_config_1 = require("../config/blockchain-config");
const novaSanctumAI_1 = require("./novaSanctumAI");
// Blockchain service class
class GameDinBlockchainService {
    constructor(config) {
        this.isInitialized = false;
        this.transactionQueue = [];
        this.consensusValidators = new Set();
        this.config = config || blockchain_config_1.BlockchainConfigFactory.getConfig();
        this.aiService = new novaSanctumAI_1.NovaSanctumAIService(this.config.ai);
    }
    /**
     * Initialize the blockchain service
     */
    async initialize() {
        try {
            // Validate configuration
            blockchain_config_1.BlockchainConfigFactory.validateConfig(this.config);
            // Initialize AI service
            await this.aiService.initialize();
            // Initialize consensus validators
            this.initializeValidators();
            this.isInitialized = true;
            console.log('GameDin L3 Blockchain service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            throw error;
        }
    }
    /**
     * Initialize consensus validators
     */
    initializeValidators() {
        // Add default validators based on configuration
        for (let i = 0; i < this.config.consensus.validators; i++) {
            this.consensusValidators.add(`validator-${i}`);
        }
    }
    /**
     * Process gaming action
     */
    async processGamingAction(action) {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }
        const transaction = {
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
        }
        else {
            await this.processDirectly(transaction);
        }
        return transaction;
    }
    /**
     * Process transaction with consensus
     */
    async processWithConsensus(transaction) {
        try {
            // Simulate consensus process
            const consensusResult = await this.runConsensus(transaction);
            if (consensusResult.success) {
                transaction.status = 'confirmed';
                transaction.blockNumber = consensusResult.blockNumber;
                transaction.gasUsed = this.calculateGasUsed(transaction);
                transaction.gasPrice = this.config.network.gasPrice;
            }
            else {
                transaction.status = 'failed';
            }
            console.log(`Consensus completed for transaction ${transaction.id} in ${consensusResult.latency}ms`);
        }
        catch (error) {
            transaction.status = 'failed';
            console.error('Consensus processing failed:', error);
        }
    }
    /**
     * Process transaction directly (no consensus required)
     */
    async processDirectly(transaction) {
        try {
            // Simulate direct processing
            await new Promise(resolve => setTimeout(resolve, 10));
            transaction.status = 'confirmed';
            transaction.blockNumber = this.generateBlockNumber();
            transaction.gasUsed = this.calculateGasUsed(transaction);
            transaction.gasPrice = this.config.network.gasPrice;
            console.log(`Direct processing completed for transaction ${transaction.id}`);
        }
        catch (error) {
            transaction.status = 'failed';
            console.error('Direct processing failed:', error);
        }
    }
    /**
     * Run consensus algorithm
     */
    async runConsensus(_transaction) {
        const startTime = Date.now();
        // Simulate BFT consensus
        const validators = Array.from(this.consensusValidators);
        const requiredVotes = Math.ceil(validators.length * (this.config.consensus.threshold / 100));
        // Simulate validator voting
        const votes = await Promise.all(validators.map(async (_validator) => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
            return Math.random() > 0.1; // 90% success rate
        }));
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
    async processAIRequest(request) {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }
        const transaction = {
            id: this.generateTransactionId(),
            type: 'aiRequest',
            data: request,
            timestamp: Date.now(),
            status: 'pending'
        };
        this.transactionQueue.push(transaction);
        try {
            const response = await this.aiService.batchProcess([request]);
            transaction.status = 'confirmed';
            const aiResponse = response[0];
            if (!aiResponse) {
                throw new Error('No AI response received');
            }
            return aiResponse;
        }
        catch (error) {
            transaction.status = 'failed';
            throw error;
        }
    }
    /**
     * Batch process multiple transactions
     */
    async batchProcessTransactions(transactions) {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }
        const results = [];
        for (const transaction of transactions) {
            try {
                if (transaction.type === 'aiRequest') {
                    const aiRequest = transaction.data;
                    await this.processAIRequest(aiRequest);
                }
                else {
                    await this.processDirectly(transaction);
                }
                results.push(transaction);
            }
            catch (error) {
                transaction.status = 'failed';
                results.push(transaction);
            }
        }
        return results;
    }
    /**
     * Get transaction by ID
     */
    getTransaction(id) {
        return this.transactionQueue.find(tx => tx.id === id);
    }
    /**
     * Get all transactions
     */
    getAllTransactions() {
        return [...this.transactionQueue];
    }
    /**
     * Get pending transactions
     */
    getPendingTransactions() {
        return this.transactionQueue.filter(tx => tx.status === 'pending');
    }
    /**
     * Get service status
     */
    getStatus() {
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
    generateTransactionId() {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate block number
     */
    generateBlockNumber() {
        return Math.floor(Date.now() / this.config.consensus.blockTime);
    }
    /**
     * Calculate gas used for transaction
     */
    calculateGasUsed(transaction) {
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
exports.GameDinBlockchainService = GameDinBlockchainService;
// Export singleton instance
let blockchainServiceInstance = null;
const getBlockchainService = (config) => {
    if (!blockchainServiceInstance) {
        blockchainServiceInstance = new GameDinBlockchainService(config);
    }
    return blockchainServiceInstance;
};
exports.getBlockchainService = getBlockchainService;
exports.default = GameDinBlockchainService;
//# sourceMappingURL=blockchainService.js.map
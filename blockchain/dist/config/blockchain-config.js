"use strict";
/**
 * GameDin L3 Blockchain Configuration
 *
 * This module provides comprehensive configuration for the GameDin Layer 3 blockchain
 * integration, including consensus settings, network parameters, and deployment options.
 *
 * @author GameDin Development Team
 * @version 4.2.0
 * @since 2024-07-06
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.BlockchainConfigFactory = exports.productionConfig = exports.developmentConfig = void 0;
// Default configurations for different environments
exports.developmentConfig = {
    network: {
        name: 'GameDin L3 Development',
        chainId: 1337420,
        rpcUrl: 'https://sepolia.base.org',
        explorerUrl: 'https://sepolia.basescan.org',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        blockTime: 2,
        gasLimit: 30000000,
        gasPrice: '2000000000'
    },
    consensus: {
        type: 'BFT',
        validators: 4,
        threshold: 67,
        blockTime: 100,
        finality: 1,
        gamingOptimized: true
    },
    gaming: {
        maxTPS: 10000,
        criticalActionLatency: 100,
        batchSize: 1000,
        gasSponsoring: true,
        nftBatching: true,
        realtimeUpdates: true,
        aiIntegration: true
    },
    ai: {
        novaSanctumEnabled: true,
        modelEndpoint: 'https://api.novasanctum.ai/v1',
        apiKey: process.env['NOVASANCTUM_API_KEY'] || '',
        features: {
            antiCheat: true,
            matchmaking: true,
            contentGeneration: true,
            analytics: true
        }
    },
    deployment: {
        environment: 'development',
        region: 'us-east-1',
        autoScaling: false,
        monitoring: true,
        backup: false,
        security: {
            waf: false,
            shield: false,
            guardDuty: false
        }
    }
};
exports.productionConfig = {
    network: {
        name: 'GameDin L3 Production',
        chainId: 1337421,
        rpcUrl: 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        blockTime: 1,
        gasLimit: 50000000,
        gasPrice: '1000000000'
    },
    consensus: {
        type: 'BFT',
        validators: 21,
        threshold: 80,
        blockTime: 50,
        finality: 1,
        gamingOptimized: true
    },
    gaming: {
        maxTPS: 50000,
        criticalActionLatency: 50,
        batchSize: 5000,
        gasSponsoring: true,
        nftBatching: true,
        realtimeUpdates: true,
        aiIntegration: true
    },
    ai: {
        novaSanctumEnabled: true,
        modelEndpoint: 'https://api.novasanctum.ai/v1',
        apiKey: process.env['NOVASANCTUM_API_KEY'] || '',
        features: {
            antiCheat: true,
            matchmaking: true,
            contentGeneration: true,
            analytics: true
        }
    },
    deployment: {
        environment: 'production',
        region: 'us-east-1',
        autoScaling: true,
        monitoring: true,
        backup: true,
        security: {
            waf: true,
            shield: true,
            guardDuty: true
        }
    }
};
// Configuration factory
class BlockchainConfigFactory {
    static getConfig(environment = 'development') {
        switch (environment) {
            case 'production':
                return exports.productionConfig;
            case 'staging':
                return { ...exports.productionConfig, deployment: { ...exports.productionConfig.deployment, environment: 'staging' } };
            default:
                return exports.developmentConfig;
        }
    }
    static validateConfig(config) {
        // Basic validation
        if (!config.network.chainId || config.network.chainId <= 0) {
            throw new Error('Invalid chain ID');
        }
        if (!config.consensus.threshold || config.consensus.threshold < 50 || config.consensus.threshold > 100) {
            throw new Error('Invalid consensus threshold');
        }
        if (!config.gaming.maxTPS || config.gaming.maxTPS <= 0) {
            throw new Error('Invalid max TPS');
        }
        return true;
    }
}
exports.BlockchainConfigFactory = BlockchainConfigFactory;
// Export default configuration
exports.defaultConfig = BlockchainConfigFactory.getConfig(process.env['NODE_ENV'] || 'development');
exports.default = exports.defaultConfig;
//# sourceMappingURL=blockchain-config.js.map
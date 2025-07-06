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

// Network configuration
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTime: number;
  gasLimit: number;
  gasPrice: string;
}

// Consensus configuration
export interface ConsensusConfig {
  type: 'BFT' | 'PoS' | 'PoA';
  validators: number;
  threshold: number;
  blockTime: number;
  finality: number;
  gamingOptimized: boolean;
}

// Gaming-specific configuration
export interface GamingConfig {
  maxTPS: number;
  criticalActionLatency: number;
  batchSize: number;
  gasSponsoring: boolean;
  nftBatching: boolean;
  realtimeUpdates: boolean;
  aiIntegration: boolean;
}

// AI integration configuration
export interface AIConfig {
  novaSanctumEnabled: boolean;
  modelEndpoint: string;
  apiKey: string;
  features: {
    antiCheat: boolean;
    matchmaking: boolean;
    contentGeneration: boolean;
    analytics: boolean;
  };
}

// Deployment configuration
export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  region: string;
  autoScaling: boolean;
  monitoring: boolean;
  backup: boolean;
  security: {
    waf: boolean;
    shield: boolean;
    guardDuty: boolean;
  };
}

// Main configuration object
export interface BlockchainConfig {
  network: NetworkConfig;
  consensus: ConsensusConfig;
  gaming: GamingConfig;
  ai: AIConfig;
  deployment: DeploymentConfig;
}

// Default configurations for different environments
export const developmentConfig: BlockchainConfig = {
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

export const productionConfig: BlockchainConfig = {
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
export class BlockchainConfigFactory {
  static getConfig(environment: string = 'development'): BlockchainConfig {
    switch (environment) {
      case 'production':
        return productionConfig;
      case 'staging':
        return { ...productionConfig, deployment: { ...productionConfig.deployment, environment: 'staging' } };
      default:
        return developmentConfig;
    }
  }

  static validateConfig(config: BlockchainConfig): boolean {
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

// Export default configuration
export const defaultConfig = BlockchainConfigFactory.getConfig(process.env['NODE_ENV'] || 'development');

export default defaultConfig; 
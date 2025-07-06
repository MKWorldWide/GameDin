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
export interface ConsensusConfig {
    type: 'BFT' | 'PoS' | 'PoA';
    validators: number;
    threshold: number;
    blockTime: number;
    finality: number;
    gamingOptimized: boolean;
}
export interface GamingConfig {
    maxTPS: number;
    criticalActionLatency: number;
    batchSize: number;
    gasSponsoring: boolean;
    nftBatching: boolean;
    realtimeUpdates: boolean;
    aiIntegration: boolean;
}
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
export interface BlockchainConfig {
    network: NetworkConfig;
    consensus: ConsensusConfig;
    gaming: GamingConfig;
    ai: AIConfig;
    deployment: DeploymentConfig;
}
export declare const developmentConfig: BlockchainConfig;
export declare const productionConfig: BlockchainConfig;
export declare class BlockchainConfigFactory {
    static getConfig(environment?: string): BlockchainConfig;
    static validateConfig(config: BlockchainConfig): boolean;
}
export declare const defaultConfig: BlockchainConfig;
export default defaultConfig;
//# sourceMappingURL=blockchain-config.d.ts.map
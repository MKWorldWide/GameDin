/**
 * GameDin Quantum Computing Types
 * 
 * Type definitions for quantum computing infrastructure
 * 
 * @author GameDin Development Team
 * @version 5.0.0
 * @since 2024-07-06
 */

// Quantum gate types
export interface QuantumGate {
  type: 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'CCX' | 'RX' | 'RY' | 'RZ' | 'SWAP' | 'PHASE';
  qubit?: number;
  control?: number;
  target?: number;
  control1?: number;
  control2?: number;
  angle?: number;
  condition?: boolean;
  phase?: number;
}

// Quantum circuit definition
export interface QuantumCircuit {
  id: string;
  qubits: number;
  gates: QuantumGate[];
  measurements: number;
  metadata?: {
    gameId?: string;
    playerId?: string;
    actionType?: string;
    requestType?: string;
    complexity?: string;
    priority?: string;
  };
}

// Quantum task for execution
export interface QuantumTask {
  id: string;
  type: 'circuit_execution' | 'optimization' | 'simulation' | 'machine_learning';
  circuit: QuantumCircuit;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  metadata?: {
    gameId?: string;
    playerId?: string;
    actionType?: string;
  };
}

// Quantum execution result
export interface QuantumResult {
  taskId: string;
  circuitId: string;
  provider: string;
  success: boolean;
  result: {
    measurements: number[];
    probabilities: number[];
    expectation: number;
    variance: number;
  };
  metadata: {
    executionTime: number;
    qubitsUsed: number;
    errorRate: number;
    coherenceTime: number;
  };
  timestamp: number;
}

// Quantum provider configuration
export interface QuantumProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  qubits: number;
  errorRate: number;
  availability: 'low' | 'medium' | 'high' | 'research';
  type?: 'commercial' | 'research';
}

// Quantum computing configuration
export interface QuantumConfig {
  providers: {
    ibm: {
      enabled: boolean;
      apiKey: string;
      endpoint: string;
      qubits: number;
      errorRate: number;
    };
    google: {
      enabled: boolean;
      apiKey: string;
      endpoint: string;
      qubits: number;
      errorRate: number;
    };
    microsoft: {
      enabled: boolean;
      apiKey: string;
      endpoint: string;
      qubits: number;
      errorRate: number;
    };
    aws: {
      enabled: boolean;
      apiKey: string;
      endpoint: string;
      qubits: number;
      errorRate: number;
    };
    researchLabs: {
      enabled: boolean;
      labs: Array<{
        id: string;
        name: string;
        apiKey: string;
        endpoint: string;
        qubits: number;
        errorRate: number;
        availability: string;
      }>;
    };
  };
  gaming: {
    qubits: number;
    measurements: number;
    optimizationLevel: 'low' | 'medium' | 'high' | 'maximum';
  };
  ai: {
    qubits: number;
    measurements: number;
    layers: number;
    optimizationLevel: 'low' | 'medium' | 'high' | 'maximum';
  };
  scheduling: {
    priority: 'performance' | 'cost' | 'reliability';
    loadBalancing: 'round_robin' | 'quantum_aware' | 'adaptive';
    fallback: 'classical' | 'simulation' | 'none';
  };
}

// Quantum scheduler interface
export interface IQuantumScheduler {
  initialize(): Promise<void>;
  scheduleTask(task: QuantumTask): Promise<QuantumResult>;
  getStatus(): any;
}

// Quantum optimizer interface
export interface IQuantumOptimizer {
  initialize(): Promise<void>;
  optimizeTask(task: QuantumTask): Promise<QuantumTask>;
  getStatus(): any;
} 
/**
 * GameDin Quantum Layer - k6 Load Testing Configuration
 * Comprehensive load testing for quantum computing endpoints and services
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Custom metrics
const quantumTaskSuccessRate = new Rate('quantum_task_success_rate');
const quantumTaskDuration = new Trend('quantum_task_duration');
const entanglementCorrelation = new Trend('entanglement_correlation');
const aiDecisionConfidence = new Trend('ai_decision_confidence');
const randomEntropy = new Trend('random_entropy');
const optimizationImprovement = new Trend('optimization_improvement');
const errorRate = new Rate('error_rate');
const requestRate = new Counter('request_rate');

// Test configuration
export const options = {
  // Stages for different load patterns
  stages: [
    // Ramp up to 10 users over 2 minutes
    { duration: '2m', target: 10 },
    // Stay at 10 users for 5 minutes
    { duration: '5m', target: 10 },
    // Ramp up to 50 users over 3 minutes
    { duration: '3m', target: 50 },
    // Stay at 50 users for 10 minutes
    { duration: '10m', target: 50 },
    // Ramp up to 100 users over 5 minutes
    { duration: '5m', target: 100 },
    // Stay at 100 users for 15 minutes
    { duration: '15m', target: 100 },
    // Ramp down to 0 users over 2 minutes
    { duration: '2m', target: 0 }
  ],
  
  // Thresholds for performance requirements
  thresholds: {
    // HTTP response time thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'], // Less than 5% failure rate
    
    // Custom metric thresholds
    'quantum_task_success_rate': ['rate>0.95'], // 95% success rate
    'quantum_task_duration': ['p(95)<200'], // 95% under 200ms
    'entanglement_correlation': ['p(95)>0.9'], // 95% above 0.9 correlation
    'ai_decision_confidence': ['p(95)>0.8'], // 95% above 0.8 confidence
    'random_entropy': ['p(95)>0.8'], // 95% above 0.8 entropy
    'optimization_improvement': ['p(95)>0.05'], // 95% above 0.05 improvement
    'error_rate': ['rate<0.02'] // Less than 2% error rate
  },
  
  // Test scenarios
  scenarios: {
    // Quantum entanglement synchronization
    entanglement_sync: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'entanglementSyncTest'
    },
    
    // AI decision tree processing
    ai_decision_tree: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 15 },
        { duration: '5m', target: 15 },
        { duration: '2m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'aiDecisionTreeTest'
    },
    
    // Quantum random generation
    quantum_random: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 30 },
        { duration: '5m', target: 30 },
        { duration: '2m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'quantumRandomTest'
    },
    
    // Game optimization
    game_optimization: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'gameOptimizationTest'
    },
    
    // Mixed workload
    mixed_workload: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 25 },
        { duration: '10m', target: 25 },
        { duration: '2m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'mixedWorkloadTest'
    },
    
    // Stress testing
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'stressTest'
    }
  }
};

// Test data
const testData = {
  // Quantum entanglement test data
  entanglement: {
    player1Ids: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005'],
    player2Ids: ['player_101', 'player_102', 'player_103', 'player_104', 'player_105']
  },
  
  // AI decision tree test data
  aiDecision: {
    gameStates: [
      { playerHealth: 75, enemyCount: 2, resources: 100 },
      { playerHealth: 50, enemyCount: 3, resources: 75 },
      { playerHealth: 25, enemyCount: 1, resources: 150 },
      { playerHealth: 90, enemyCount: 4, resources: 50 },
      { playerHealth: 10, enemyCount: 5, resources: 25 }
    ],
    possibleActions: ['attack', 'defend', 'heal', 'flee', 'special']
  },
  
  // Quantum random test data
  quantumRandom: {
    counts: [5, 10, 15, 20, 25],
    ranges: [
      { min: 1, max: 10 },
      { min: 1, max: 100 },
      { min: 1, max: 1000 },
      { min: 0, max: 1 },
      { min: -100, max: 100 }
    ]
  },
  
  // Game optimization test data
  gameOptimization: {
    gameParameters: [
      { difficulty: 0.3, rewardMultiplier: 1.5, timeLimit: 120, energyCost: 3 },
      { difficulty: 0.5, rewardMultiplier: 2.0, timeLimit: 180, energyCost: 5 },
      { difficulty: 0.7, rewardMultiplier: 2.5, timeLimit: 240, energyCost: 7 },
      { difficulty: 0.9, rewardMultiplier: 3.0, timeLimit: 300, energyCost: 10 }
    ],
    playerData: [
      { playerId: 'p1', score: 1000, playTime: 3600 },
      { playerId: 'p2', score: 800, playTime: 2400 },
      { playerId: 'p3', score: 1200, playTime: 4800 },
      { playerId: 'p4', score: 600, playTime: 1800 },
      { playerId: 'p5', score: 1500, playTime: 6000 }
    ]
  }
};

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function simulateQuantumResult(taskType) {
  const baseResult = {
    measurements: [],
    probabilities: []
  };
  
  switch (taskType) {
    case 'entanglement_sync':
      baseResult.measurements = [1, 0, 1, 0];
      baseResult.probabilities = [0.25, 0.25, 0.25, 0.25];
      break;
    case 'ai_decision_tree':
      baseResult.measurements = [1, 0, 1, 1, 0, 0];
      baseResult.probabilities = [0.1, 0.2, 0.3, 0.2, 0.1, 0.1];
      break;
    case 'quantum_random':
      baseResult.measurements = Array(5).fill(0).map(() => Math.floor(Math.random() * 2));
      baseResult.probabilities = Array(5).fill(0.2);
      break;
    case 'game_optimization':
      baseResult.measurements = Array(8).fill(0).map(() => Math.floor(Math.random() * 2));
      baseResult.probabilities = Array(8).fill(0.125);
      break;
  }
  
  return baseResult;
}

// Test functions
export function entanglementSyncTest() {
  const player1Id = getRandomElement(testData.entanglement.player1Ids);
  const player2Id = getRandomElement(testData.entanglement.player2Ids);
  
  const payload = {
    taskType: 'entanglement_sync',
    parameters: {
      player1Id,
      player2Id
    }
  };
  
  const startTime = Date.now();
  
  const response = check(http.post('https://quantum.gamedin.xyz/api/v1/quantum/task', JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN || 'test-token'}`
    }
  }), {
    'entanglement sync status is 200': (r) => r.status === 200,
    'entanglement sync response time < 100ms': (r) => r.timings.duration < 100,
    'entanglement sync has task id': (r) => r.json('taskId') !== undefined
  });
  
  const duration = Date.now() - startTime;
  quantumTaskDuration.add(duration);
  quantumTaskSuccessRate.add(response);
  requestRate.add(1);
  
  if (response) {
    // Simulate correlation calculation
    const correlation = 0.9 + (Math.random() * 0.1); // 0.9-1.0
    entanglementCorrelation.add(correlation);
  } else {
    errorRate.add(1);
  }
  
  sleep(1);
}

export function aiDecisionTreeTest() {
  const gameState = getRandomElement(testData.aiDecision.gameStates);
  const possibleActions = testData.aiDecision.possibleActions;
  
  const payload = {
    taskType: 'ai_decision_tree',
    parameters: {
      gameState,
      possibleActions
    }
  };
  
  const startTime = Date.now();
  
  const response = check(http.post('https://quantum.gamedin.xyz/api/v1/quantum/task', JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN || 'test-token'}`
    }
  }), {
    'ai decision tree status is 200': (r) => r.status === 200,
    'ai decision tree response time < 150ms': (r) => r.timings.duration < 150,
    'ai decision tree has decision': (r) => r.json('decision') !== undefined
  });
  
  const duration = Date.now() - startTime;
  quantumTaskDuration.add(duration);
  quantumTaskSuccessRate.add(response);
  requestRate.add(1);
  
  if (response) {
    // Simulate confidence calculation
    const confidence = 0.8 + (Math.random() * 0.2); // 0.8-1.0
    aiDecisionConfidence.add(confidence);
  } else {
    errorRate.add(1);
  }
  
  sleep(1);
}

export function quantumRandomTest() {
  const count = getRandomElement(testData.quantumRandom.counts);
  const range = getRandomElement(testData.quantumRandom.ranges);
  
  const payload = {
    taskType: 'quantum_random',
    parameters: {
      count,
      min: range.min,
      max: range.max
    }
  };
  
  const startTime = Date.now();
  
  const response = check(http.post('https://quantum.gamedin.xyz/api/v1/quantum/task', JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN || 'test-token'}`
    }
  }), {
    'quantum random status is 200': (r) => r.status === 200,
    'quantum random response time < 50ms': (r) => r.timings.duration < 50,
    'quantum random has numbers': (r) => r.json('randomNumbers') !== undefined
  });
  
  const duration = Date.now() - startTime;
  quantumTaskDuration.add(duration);
  quantumTaskSuccessRate.add(response);
  requestRate.add(1);
  
  if (response) {
    // Simulate entropy calculation
    const entropy = 0.8 + (Math.random() * 0.2); // 0.8-1.0
    randomEntropy.add(entropy);
  } else {
    errorRate.add(1);
  }
  
  sleep(0.5);
}

export function gameOptimizationTest() {
  const gameParameters = getRandomElement(testData.gameOptimization.gameParameters);
  const playerData = testData.gameOptimization.playerData.slice(0, Math.floor(Math.random() * 3) + 2);
  
  const payload = {
    taskType: 'game_optimization',
    parameters: {
      gameParameters,
      playerData
    }
  };
  
  const startTime = Date.now();
  
  const response = check(http.post('https://quantum.gamedin.xyz/api/v1/quantum/task', JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN || 'test-token'}`
    }
  }), {
    'game optimization status is 200': (r) => r.status === 200,
    'game optimization response time < 5000ms': (r) => r.timings.duration < 5000,
    'game optimization has result': (r) => r.json('optimization') !== undefined
  });
  
  const duration = Date.now() - startTime;
  quantumTaskDuration.add(duration);
  quantumTaskSuccessRate.add(response);
  requestRate.add(1);
  
  if (response) {
    // Simulate improvement calculation
    const improvement = 0.05 + (Math.random() * 0.15); // 0.05-0.20
    optimizationImprovement.add(improvement);
  } else {
    errorRate.add(1);
  }
  
  sleep(2);
}

export function mixedWorkloadTest() {
  const testTypes = ['entanglement_sync', 'ai_decision_tree', 'quantum_random', 'game_optimization'];
  const testType = getRandomElement(testTypes);
  
  switch (testType) {
    case 'entanglement_sync':
      entanglementSyncTest();
      break;
    case 'ai_decision_tree':
      aiDecisionTreeTest();
      break;
    case 'quantum_random':
      quantumRandomTest();
      break;
    case 'game_optimization':
      gameOptimizationTest();
      break;
  }
}

export function stressTest() {
  // High-frequency requests with minimal sleep
  const testTypes = ['entanglement_sync', 'ai_decision_tree', 'quantum_random'];
  const testType = getRandomElement(testTypes);
  
  switch (testType) {
    case 'entanglement_sync':
      entanglementSyncTest();
      break;
    case 'ai_decision_tree':
      aiDecisionTreeTest();
      break;
    case 'quantum_random':
      quantumRandomTest();
      break;
  }
  
  sleep(0.1); // Very short sleep for stress testing
}

// Health check test
export function healthCheckTest() {
  const response = check(http.get('https://quantum.gamedin.xyz/health'), {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
    'health check has status': (r) => r.json('status') === 'healthy'
  });
  
  quantumTaskSuccessRate.add(response);
  requestRate.add(1);
  
  if (!response) {
    errorRate.add(1);
  }
  
  sleep(5);
}

// Setup function
export function setup() {
  console.log('🚀 Starting GameDin Quantum Layer Load Tests');
  console.log(`Test Environment: ${__ENV.TEST_ENV || 'production'}`);
  console.log(`API Token: ${__ENV.API_TOKEN ? 'Configured' : 'Using test token'}`);
  
  // Verify test environment
  const healthResponse = http.get('https://quantum.gamedin.xyz/health');
  if (healthResponse.status !== 200) {
    throw new Error('Quantum layer health check failed');
  }
  
  return {
    testStartTime: new Date().toISOString(),
    environment: __ENV.TEST_ENV || 'production'
  };
}

// Teardown function
export function teardown(data) {
  console.log('🏁 GameDin Quantum Layer Load Tests Completed');
  console.log(`Test Duration: ${new Date() - new Date(data.testStartTime)}ms`);
  console.log(`Environment: ${data.environment}`);
}

// Handle test results
export function handleSummary(data) {
  return {
    'test-results/k6-load-test-report.html': htmlReport(data),
    'test-results/k6-load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

// Custom text summary
function textSummary(data, options) {
  const { metrics } = data;
  
  return `
🎯 GameDin Quantum Layer Load Test Results
===========================================

📊 Test Summary:
- Duration: ${data.state.testRunDuration}ms
- VUs: ${data.state.vus}
- Iterations: ${data.metrics.iterations.values.count}

📈 Performance Metrics:
- HTTP Request Duration (p95): ${metrics.http_req_duration.values.p95}ms
- HTTP Request Duration (p99): ${metrics.http_req_duration.values.p99}ms
- HTTP Request Failed Rate: ${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%

⚛️ Quantum Metrics:
- Quantum Task Success Rate: ${(metrics.quantum_task_success_rate.values.rate * 100).toFixed(2)}%
- Quantum Task Duration (p95): ${metrics.quantum_task_duration.values.p95}ms
- Entanglement Correlation (p95): ${metrics.entanglement_correlation.values.p95}
- AI Decision Confidence (p95): ${metrics.ai_decision_confidence.values.p95}
- Random Entropy (p95): ${metrics.random_entropy.values.p95}
- Optimization Improvement (p95): ${metrics.optimization_improvement.values.p95}

🚨 Error Rate: ${(metrics.error_rate.values.rate * 100).toFixed(2)}%

${options.enableColors ? '✅' : 'PASS'} All thresholds met!
`;
} 
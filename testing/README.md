# GameDin Quantum Layer - Testing Infrastructure

## Overview

This testing infrastructure provides comprehensive testing capabilities for the GameDin quantum computing layer, including unit tests, integration tests, load testing, and deployment validation.

## Testing Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Unit Tests    │    │  Integration    │    │   Load Tests    │
│   (Jest)        │    │   Tests         │    │   (k6)          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │             ┌─────────────────┐              │
         │             │  Deployment     │              │
         │             │  Validation     │              │
         │             └─────────────────┘              │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Test Results  │
                    │   & Reports     │
                    └─────────────────┘
```

## Testing Components

### 1. Unit Testing (Jest)

**Configuration:** `jest.config.js`

**Features:**
- TypeScript support with ts-jest
- Coverage reporting with thresholds
- Multiple test projects (unit, integration, quantum, blockchain)
- Custom metrics and assertions
- HTML and JUnit reports

**Test Structure:**
```
src/
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── integration/
│       ├── api/
│       ├── database/
│       └── external/
quantum-tasks/
├── __tests__/
│   ├── examples/
│   ├── testing/
│   └── validation/
blockchain/
├── __tests__/
│   ├── contracts/
│   ├── transactions/
│   └── integration/
```

**Coverage Thresholds:**
- Global: 80% (branches, functions, lines, statements)
- Source code: 85%
- Quantum tasks: 90%
- Blockchain: 85%

### 2. Load Testing (k6)

**Configuration:** `k6-load-tests.js`

**Test Scenarios:**
- **Entanglement Sync:** Real-time multiplayer synchronization
- **AI Decision Tree:** Quantum-enhanced AI decision making
- **Quantum Random:** True quantum randomness generation
- **Game Optimization:** Quantum optimization algorithms
- **Mixed Workload:** Combined scenario testing
- **Stress Testing:** High-frequency request testing

**Performance Thresholds:**
- HTTP Request Duration: p95 < 500ms, p99 < 1000ms
- HTTP Request Failed Rate: < 5%
- Quantum Task Success Rate: > 95%
- Quantum Task Duration: p95 < 200ms
- Entanglement Correlation: p95 > 0.9
- AI Decision Confidence: p95 > 0.8
- Random Entropy: p95 > 0.8
- Optimization Improvement: p95 > 0.05
- Error Rate: < 2%

**Load Patterns:**
```
Stage 1: Ramp up to 10 users (2 minutes)
Stage 2: Stay at 10 users (5 minutes)
Stage 3: Ramp up to 50 users (3 minutes)
Stage 4: Stay at 50 users (10 minutes)
Stage 5: Ramp up to 100 users (5 minutes)
Stage 6: Stay at 100 users (15 minutes)
Stage 7: Ramp down to 0 users (2 minutes)
```

### 3. Deployment Validation

**Script:** `deployment-validation.sh`

**Validation Tests:**
- **Deployment Creation:** Verify deployment creation and readiness
- **Health Checks:** Validate pod health and liveness probes
- **Service Exposure:** Test service connectivity and routing
- **Ingress Configuration:** Validate ingress setup and SSL
- **Rollback Testing:** Test deployment rollback functionality
- **Redeployment Testing:** Verify deployment updates
- **Data Persistence:** Validate PVC and storage
- **Performance Validation:** Check resource usage
- **Security Validation:** Verify security policies
- **Monitoring Integration:** Check monitoring components

## Usage

### Running Unit Tests

```bash
# Run all tests
npm test

# Run specific test projects
npm run test:unit
npm run test:integration
npm run test:quantum
npm run test:blockchain

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Running Load Tests

```bash
# Install k6
# macOS
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Run load tests
k6 run testing/k6-load-tests.js

# Run with environment variables
TEST_ENV=staging API_TOKEN=your-token k6 run testing/k6-load-tests.js

# Run specific scenarios
k6 run --scenario entanglement_sync testing/k6-load-tests.js
k6 run --scenario stress_test testing/k6-load-tests.js
```

### Running Deployment Validation

```bash
# Make script executable
chmod +x testing/deployment-validation.sh

# Run validation
./testing/deployment-validation.sh

# Run with custom configuration
NAMESPACE=custom-namespace CLUSTER_NAME=custom-cluster ./testing/deployment-validation.sh
```

## Test Data

### Quantum Task Test Data

```javascript
// Entanglement test data
entanglement: {
  player1Ids: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005'],
  player2Ids: ['player_101', 'player_102', 'player_103', 'player_104', 'player_105']
}

// AI decision test data
aiDecision: {
  gameStates: [
    { playerHealth: 75, enemyCount: 2, resources: 100 },
    { playerHealth: 50, enemyCount: 3, resources: 75 },
    { playerHealth: 25, enemyCount: 1, resources: 150 },
    { playerHealth: 90, enemyCount: 4, resources: 50 },
    { playerHealth: 10, enemyCount: 5, resources: 25 }
  ],
  possibleActions: ['attack', 'defend', 'heal', 'flee', 'special']
}

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
}

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
```

## Test Reports

### Unit Test Reports

**Location:** `test-results/`

**Reports:**
- `junit.xml` - JUnit format for CI/CD integration
- `test-report.html` - HTML report with detailed results
- `coverage/` - Coverage reports in multiple formats

### Load Test Reports

**Location:** `test-results/`

**Reports:**
- `k6-load-test-report.html` - Interactive HTML report
- `k6-load-test-summary.json` - JSON summary data

### Deployment Validation Reports

**Location:** `validation-results/`

**Reports:**
- `validation-report-YYYYMMDD_HHMMSS.md` - Markdown report
- `validation-log-YYYYMMDD_HHMMSS.log` - Detailed log

## Configuration

### Environment Variables

```bash
# Testing environment
TEST_ENV=production|staging|development

# API configuration
API_TOKEN=your-api-token
API_BASE_URL=https://quantum.gamedin.xyz

# Kubernetes configuration
KUBECONFIG=~/.kube/config
NAMESPACE=gamedin-l3
CLUSTER_NAME=gamedin-l3-cluster

# Load testing configuration
K6_VUS=100
K6_DURATION=30m
K6_RAMP_UP=5m
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // ... additional configuration
};
```

### k6 Configuration

```javascript
// k6-load-tests.js
export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    // ... additional stages
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],
    // ... additional thresholds
  }
};
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test GameDin Quantum Layer

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm test
    
    - name: Run load tests
      run: k6 run testing/k6-load-tests.js
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results/
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - load-test
  - validate

unit_test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  artifacts:
    reports:
      junit: test-results/junit.xml
    paths:
      - test-results/

load_test:
  stage: load-test
  image: grafana/k6:latest
  script:
    - k6 run testing/k6-load-tests.js
  artifacts:
    paths:
      - test-results/

deployment_validation:
  stage: validate
  image: bitnami/kubectl:latest
  script:
    - ./testing/deployment-validation.sh
  artifacts:
    paths:
      - validation-results/
```

## Monitoring and Alerting

### Test Metrics

**Unit Test Metrics:**
- Test execution time
- Coverage percentage
- Failed test count
- Test suite size

**Load Test Metrics:**
- Request rate (RPS)
- Response time percentiles
- Error rate
- Quantum task success rate
- Custom quantum metrics

**Deployment Metrics:**
- Deployment success rate
- Rollback frequency
- Resource usage
- Health check status

### Alerting Rules

```yaml
# prometheus/rules/test-alerts.yml
groups:
  - name: test-alerts
    rules:
      - alert: TestFailureRate
        expr: rate(test_failures_total[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High test failure rate detected"
          
      - alert: LoadTestThreshold
        expr: k6_http_req_failed_rate > 0.05
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Load test failure rate exceeded threshold"
          
      - alert: DeploymentValidation
        expr: deployment_validation_failures > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Deployment validation failures detected"
```

## Troubleshooting

### Common Issues

**Unit Tests:**
- **TypeScript compilation errors:** Check tsconfig.json and dependencies
- **Coverage threshold failures:** Review test coverage and add missing tests
- **Timeout errors:** Increase test timeout in jest.config.js

**Load Tests:**
- **Connection errors:** Verify API endpoints and network connectivity
- **Threshold failures:** Review performance requirements and optimize
- **Resource exhaustion:** Reduce VU count or test duration

**Deployment Validation:**
- **Kubernetes connection:** Check kubeconfig and cluster access
- **Resource creation failures:** Verify namespace and permissions
- **Timeout errors:** Increase timeout values for slow operations

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm test

# Verbose k6 output
k6 run --verbose testing/k6-load-tests.js

# Detailed validation logging
VERBOSE=true ./testing/deployment-validation.sh
```

### Performance Tuning

**Jest Performance:**
```javascript
// jest.config.js
module.exports = {
  maxWorkers: '50%',
  cacheDirectory: '<rootDir>/.jest-cache',
  // ... other optimizations
};
```

**k6 Performance:**
```javascript
// k6-load-tests.js
export const options = {
  maxWorkers: 4,
  // ... other optimizations
};
```

## Best Practices

### Test Organization

1. **Group related tests:** Use describe blocks for logical grouping
2. **Use descriptive names:** Test names should clearly describe what they test
3. **Follow AAA pattern:** Arrange, Act, Assert
4. **Keep tests independent:** Tests should not depend on each other
5. **Use test data factories:** Create reusable test data

### Load Testing

1. **Start small:** Begin with low load and gradually increase
2. **Monitor resources:** Watch CPU, memory, and network usage
3. **Use realistic data:** Test with production-like data
4. **Test failure scenarios:** Include error conditions and edge cases
5. **Document thresholds:** Clearly define performance requirements

### Deployment Validation

1. **Test rollback procedures:** Ensure rollback works before deployment
2. **Validate all components:** Check all services and dependencies
3. **Monitor post-deployment:** Continue monitoring after deployment
4. **Document procedures:** Keep validation procedures up to date
5. **Automate where possible:** Reduce manual validation steps

## Support

For testing issues and questions:

1. **Check documentation:** Review this README and inline comments
2. **Review logs:** Check test logs for detailed error information
3. **Run in debug mode:** Enable verbose logging for troubleshooting
4. **Contact team:** Reach out to the quantum development team

---

**Happy testing!** 🧪⚛️ 
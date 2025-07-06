/**
 * Test Runner Component
 *
 * This component provides a user interface for running automated tests and viewing
 * test results in the GameDin application during development.
 *
 * Feature Context:
 * - Displays all available test cases and scenarios
 * - Allows running individual tests or full scenarios
 * - Shows test results and statistics
 * - Provides test data management tools
 *
 * Usage Example:
 *   <TestRunner />
 *
 * Dependency Listing:
 * - MockService (frontend/src/services/mockService.ts)
 * - Development utilities (frontend/src/config/development.ts)
 * - React hooks and components
 *
 * Performance Considerations:
 * - Efficient test execution with progress indicators
 * - Optimized rendering for large test suites
 * - Memory management for test results
 *
 * Security Implications:
 * - Only available in development mode
 * - No sensitive data in test results
 * - Safe for local development use
 *
 * Changelog:
 * - [v3.2.2] Created TestRunner component for automated testing interface
 */

import React, { useState, useEffect } from 'react';

import { getDevelopmentUtils } from '../config/development';
import { mockService } from '../services/mockService';

/**
 * Test Result Interface
 */
interface TestResult {
  id: string;
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  timestamp: Date;
}

/**
 * Test Runner Props
 */
interface TestRunnerProps {
  className?: string;
}

/**
 * Test Runner Component
 */
export const TestRunner: React.FC<TestRunnerProps> = ({ className = '' }) => {
  const [testCases, setTestCases] = useState<any[]>([]);
  const [testScenarios, setTestScenarios] = useState<any[]>([]);
  const [runningTests, setRunningTests] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const devUtils = getDevelopmentUtils();

  useEffect(() => {
    loadTestData();
  }, []);

  /**
   * Load test cases and scenarios
   */
  const loadTestData = () => {
    const cases = devUtils.getTestCases();
    const scenarios = devUtils.getTestScenarios();

    setTestCases(cases);
    setTestScenarios(scenarios);
  };

  /**
   * Run a single test case
   */
  const runTestCase = async(testCase: any) => {
    setRunningTests(prev => [...prev, testCase.id]);

    try {
      const startTime = Date.now();
      const result = await devUtils.runTestCase(testCase.id);
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        id: testCase.id,
        name: testCase.name,
        success: result.success,
        duration,
        error: result.error,
        timestamp: new Date(),
      };

      setTestResults(prev => [testResult, ...prev]);
    } catch (error) {
      const testResult: TestResult = {
        id: testCase.id,
        name: testCase.name,
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };

      setTestResults(prev => [testResult, ...prev]);
    } finally {
      setRunningTests(prev => prev.filter(id => id !== testCase.id));
    }
  };

  /**
   * Run a test scenario
   */
  const runTestScenario = async(scenario: any) => {
    setRunningTests(prev => [...prev, scenario.id]);

    try {
      const startTime = Date.now();
      const result = await devUtils.runTestScenario(scenario.id);
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        id: scenario.id,
        name: scenario.name,
        success: result.success,
        duration,
        error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
        timestamp: new Date(),
      };

      setTestResults(prev => [testResult, ...prev]);
    } catch (error) {
      const testResult: TestResult = {
        id: scenario.id,
        name: scenario.name,
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };

      setTestResults(prev => [testResult, ...prev]);
    } finally {
      setRunningTests(prev => prev.filter(id => id !== scenario.id));
    }
  };

  /**
   * Run all tests in a category
   */
  const runCategoryTests = async(category: string) => {
    setIsLoading(true);

    try {
      const categoryTests = testCases.filter(test =>
        category === 'all' || test.category === category);

      for (const test of categoryTests) {
        await runTestCase(test);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear test results
   */
  const clearResults = () => {
    setTestResults([]);
  };

  /**
   * Export test results
   */
  const exportResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-results-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Get filtered test cases
   */
  const getFilteredTestCases = () => {
    return testCases.filter(test => {
      const categoryMatch = selectedCategory === 'all' || test.category === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || test.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  };

  /**
   * Get test statistics
   */
  const getTestStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.success).length;
    const failed = total - passed;
    const avgDuration = total > 0 ? testResults.reduce((sum, r) => sum + r.duration, 0) / total : 0;

    return { total, passed, failed, avgDuration };
  };

  const stats = getTestStats();
  const filteredTests = getFilteredTestCases();

  return (
    <div className={`test-runner ${className}`}>
      <div className="test-runner-header">
        <h2>🧪 Test Runner</h2>
        <div className="test-runner-controls">
          <button
            onClick={() => runCategoryTests(selectedCategory)}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Running...' : 'Run Category Tests'}
          </button>
          <button onClick={clearResults} className="btn btn-secondary">
            Clear Results
          </button>
          <button onClick={exportResults} className="btn btn-secondary">
            Export Results
          </button>
        </div>
      </div>

      <div className="test-runner-stats">
        <div className="stat-card">
          <h3>Total Tests</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card success">
          <h3>Passed</h3>
          <p>{stats.passed}</p>
        </div>
        <div className="stat-card error">
          <h3>Failed</h3>
          <p>{stats.failed}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Duration</h3>
          <p>{stats.avgDuration.toFixed(0)}ms</p>
        </div>
      </div>

      <div className="test-runner-filters">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="Authentication">Authentication</option>
          <option value="User Profile">User Profile</option>
          <option value="Social Interactions">Social Interactions</option>
          <option value="Gaming">Gaming</option>
          <option value="Messaging">Messaging</option>
          <option value="Search">Search</option>
          <option value="Notifications">Notifications</option>
          <option value="Performance">Performance</option>
          <option value="Edge Cases">Edge Cases</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="test-runner-content">
        <div className="test-cases-section">
          <h3>Test Cases ({filteredTests.length})</h3>
          <div className="test-cases-list">
            {filteredTests.map(test => (
              <div key={test.id} className="test-case-item">
                <div className="test-case-info">
                  <h4>{test.name}</h4>
                  <p>{test.description}</p>
                  <div className="test-case-meta">
                    <span className={`priority priority-${test.priority}`}>
                      {test.priority}
                    </span>
                    <span className="category">{test.category}</span>
                  </div>
                </div>
                <div className="test-case-actions">
                  <button
                    onClick={() => runTestCase(test)}
                    disabled={runningTests.includes(test.id)}
                    className="btn btn-sm btn-primary"
                  >
                    {runningTests.includes(test.id) ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="test-scenarios-section">
          <h3>Test Scenarios ({testScenarios.length})</h3>
          <div className="test-scenarios-list">
            {testScenarios.map(scenario => (
              <div key={scenario.id} className="test-scenario-item">
                <div className="test-scenario-info">
                  <h4>{scenario.name}</h4>
                  <p>{scenario.description}</p>
                  <div className="test-scenario-meta">
                    <span className="test-count">
                      {scenario.testCases.length} tests
                    </span>
                  </div>
                </div>
                <div className="test-scenario-actions">
                  <button
                    onClick={() => runTestScenario(scenario)}
                    disabled={runningTests.includes(scenario.id)}
                    className="btn btn-sm btn-primary"
                  >
                    {runningTests.includes(scenario.id) ? 'Running...' : 'Run Scenario'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="test-results-section">
          <h3>Test Results ({testResults.length})</h3>
          <div className="test-results-list">
            {testResults.map(result => (
              <div key={`${result.id}-${result.timestamp.getTime()}`} className={`test-result-item ${result.success ? 'success' : 'error'}`}>
                <div className="test-result-info">
                  <h4>{result.name}</h4>
                  <div className="test-result-meta">
                    <span className={`status ${result.success ? 'success' : 'error'}`}>
                      {result.success ? '✅ Passed' : '❌ Failed'}
                    </span>
                    <span className="duration">{result.duration}ms</span>
                    <span className="timestamp">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {result.error && (
                    <p className="error-message">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .test-runner {
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .test-runner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .test-runner-header h2 {
          margin: 0;
          color: #333;
        }

        .test-runner-controls {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .test-runner-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
        }

        .stat-card p {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .stat-card.success p {
          color: #28a745;
        }

        .stat-card.error p {
          color: #dc3545;
        }

        .test-runner-filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 14px;
        }

        .test-runner-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .test-cases-section,
        .test-scenarios-section,
        .test-results-section {
          background: white;
          padding: 20px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .test-results-section {
          grid-column: 1 / -1;
        }

        .test-cases-section h3,
        .test-scenarios-section h3,
        .test-results-section h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .test-cases-list,
        .test-scenarios-list,
        .test-results-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .test-case-item,
        .test-scenario-item,
        .test-result-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 4px;
          background: #fafafa;
        }

        .test-result-item.success {
          border-color: #d4edda;
          background: #f8fff9;
        }

        .test-result-item.error {
          border-color: #f5c6cb;
          background: #fff8f8;
        }

        .test-case-info,
        .test-scenario-info,
        .test-result-info {
          flex: 1;
        }

        .test-case-info h4,
        .test-scenario-info h4,
        .test-result-info h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #333;
        }

        .test-case-info p,
        .test-scenario-info p {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
        }

        .test-case-meta,
        .test-scenario-meta,
        .test-result-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .priority {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .priority-critical {
          background: #dc3545;
          color: white;
        }

        .priority-high {
          background: #fd7e14;
          color: white;
        }

        .priority-medium {
          background: #ffc107;
          color: #212529;
        }

        .priority-low {
          background: #6c757d;
          color: white;
        }

        .category,
        .test-count,
        .duration,
        .timestamp {
          font-size: 12px;
          color: #666;
        }

        .status {
          font-weight: bold;
        }

        .status.success {
          color: #28a745;
        }

        .status.error {
          color: #dc3545;
        }

        .error-message {
          margin: 10px 0 0 0;
          font-size: 12px;
          color: #dc3545;
          background: #f8d7da;
          padding: 8px;
          border-radius: 3px;
        }

        .test-case-actions,
        .test-scenario-actions {
          margin-left: 15px;
        }

        @media (max-width: 768px) {
          .test-runner-content {
            grid-template-columns: 1fr;
          }
          
          .test-runner-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
          
          .test-runner-controls {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TestRunner;

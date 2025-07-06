#!/usr/bin/env node

/**
 * AWS Monitoring Setup Script for GameDin
 * 
 * This script configures AWS CloudWatch and X-Ray monitoring for the GameDin application.
 * It sets up custom metrics, dashboards, and alerting for performance and cost optimization.
 * 
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

const { CloudWatchClient, PutMetricDataCommand, CreateDashboardCommand } = require('@aws-sdk/client-cloudwatch');
const { XRayClient, PutTraceSegmentsCommand } = require('@aws-sdk/client-xray');
const fs = require('fs');
const path = require('path');

// AWS configuration
const awsConfig = {
  region: process.env.VITE_AWS_REGION || 'us-east-1',
  applicationName: 'GameDin',
  environment: process.env.VITE_APP_ENV || 'production'
};

// Initialize AWS clients
const cloudWatchClient = new CloudWatchClient({ region: awsConfig.region });
const xRayClient = new XRayClient({ region: awsConfig.region });

/**
 * Setup CloudWatch monitoring dashboard
 */
async function setupCloudWatchDashboard() {
  try {
    console.log('🔧 Setting up CloudWatch monitoring dashboard...');
    
    const dashboardBody = {
      widgets: [
        // Performance metrics
        {
          type: 'metric',
          x: 0,
          y: 0,
          width: 12,
          height: 6,
          properties: {
            metrics: [
              ['AWS/CloudFront', 'Requests', 'DistributionId', '${CLOUDFRONT_DISTRIBUTION_ID}'],
              ['.', 'BytesDownloaded', '.', '.'],
              ['.', 'TotalErrorRate', '.', '.']
            ],
            view: 'timeSeries',
            stacked: false,
            region: awsConfig.region,
            title: 'CloudFront Performance Metrics',
            period: 300
          }
        },
        // Cost optimization metrics
        {
          type: 'metric',
          x: 12,
          y: 0,
          width: 12,
          height: 6,
          properties: {
            metrics: [
              ['AWS/CloudFront', 'BytesDownloaded', 'DistributionId', '${CLOUDFRONT_DISTRIBUTION_ID}'],
              ['.', 'Requests', '.', '.'],
              ['.', '4xxErrorRate', '.', '.'],
              ['.', '5xxErrorRate', '.', '.']
            ],
            view: 'timeSeries',
            stacked: false,
            region: awsConfig.region,
            title: 'CloudFront Cost & Error Metrics',
            period: 300
          }
        },
        // Custom application metrics
        {
          type: 'metric',
          x: 0,
          y: 6,
          width: 12,
          height: 6,
          properties: {
            metrics: [
              ['GameDin', 'PageLoadTime', 'Environment', awsConfig.environment],
              ['.', 'UserEngagement', '.', '.'],
              ['.', 'ErrorRate', '.', '.']
            ],
            view: 'timeSeries',
            stacked: false,
            region: awsConfig.region,
            title: 'GameDin Application Metrics',
            period: 300
          }
        },
        // Lambda@Edge performance
        {
          type: 'metric',
          x: 12,
          y: 6,
          width: 12,
          height: 6,
          properties: {
            metrics: [
              ['AWS/Lambda', 'Duration', 'FunctionName', '${LAMBDA_EDGE_FUNCTION}'],
              ['.', 'Invocations', '.', '.'],
              ['.', 'Errors', '.', '.'],
              ['.', 'Throttles', '.', '.']
            ],
            view: 'timeSeries',
            stacked: false,
            region: awsConfig.region,
            title: 'Lambda@Edge Performance',
            period: 300
          }
        }
      ]
    };

    const command = new CreateDashboardCommand({
      DashboardName: `${awsConfig.applicationName}-${awsConfig.environment}-Dashboard`,
      DashboardBody: JSON.stringify(dashboardBody)
    });

    await cloudWatchClient.send(command);
    console.log('✅ CloudWatch dashboard created successfully');
    
  } catch (error) {
    console.error('❌ Error setting up CloudWatch dashboard:', error);
  }
}

/**
 * Setup custom metrics for application monitoring
 */
async function setupCustomMetrics() {
  try {
    console.log('📊 Setting up custom application metrics...');
    
    const customMetrics = [
      {
        MetricData: [
          {
            MetricName: 'PageLoadTime',
            Dimensions: [
              { Name: 'Environment', Value: awsConfig.environment },
              { Name: 'Application', Value: awsConfig.applicationName }
            ],
            Value: 0,
            Unit: 'Milliseconds',
            Timestamp: new Date()
          },
          {
            MetricName: 'UserEngagement',
            Dimensions: [
              { Name: 'Environment', Value: awsConfig.environment },
              { Name: 'Application', Value: awsConfig.applicationName }
            ],
            Value: 0,
            Unit: 'Count',
            Timestamp: new Date()
          },
          {
            MetricName: 'ErrorRate',
            Dimensions: [
              { Name: 'Environment', Value: awsConfig.environment },
              { Name: 'Application', Value: awsConfig.applicationName }
            ],
            Value: 0,
            Unit: 'Percent',
            Timestamp: new Date()
          }
        ],
        Namespace: awsConfig.applicationName
      }
    ];

    for (const metric of customMetrics) {
      const command = new PutMetricDataCommand(metric);
      await cloudWatchClient.send(command);
    }
    
    console.log('✅ Custom metrics setup completed');
    
  } catch (error) {
    console.error('❌ Error setting up custom metrics:', error);
  }
}

/**
 * Setup X-Ray tracing configuration
 */
async function setupXRayTracing() {
  try {
    console.log('🔍 Setting up X-Ray tracing...');
    
    // Create X-Ray configuration file
    const xRayConfig = {
      tracing: {
        enabled: true,
        sampling: {
          rules: [
            {
              description: 'Default sampling rule',
              host: '*',
              http_method: '*',
              url_path: '*',
              fixed_target: 1,
              rate: 0.05
            }
          ]
        }
      }
    };

    const configPath = path.join(__dirname, '../src/aws/xray-config.json');
    fs.writeFileSync(configPath, JSON.stringify(xRayConfig, null, 2));
    
    console.log('✅ X-Ray tracing configuration created');
    
  } catch (error) {
    console.error('❌ Error setting up X-Ray tracing:', error);
  }
}

/**
 * Create monitoring utilities for the application
 */
function createMonitoringUtilities() {
  try {
    console.log('🛠️ Creating monitoring utilities...');
    
    const awsDir = path.join(__dirname, '../src/aws');
    if (!fs.existsSync(awsDir)) {
      fs.mkdirSync(awsDir, { recursive: true });
    }

    // Create monitoring service
    const monitoringServiceContent = [
      "import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';",
      "import { XRayClient, PutTraceSegmentsCommand } from '@aws-sdk/client-xray';",
      "",
      "/**",
      " * AWS Monitoring Service for GameDin",
      " * Provides CloudWatch metrics and X-Ray tracing capabilities",
      " */",
      "",
      "class AWSMonitoringService {",
      "  private cloudWatchClient: CloudWatchClient;",
      "  private xRayClient: XRayClient;",
      "  private applicationName: string;",
      "  private environment: string;",
      "",
      "  constructor() {",
      "    this.cloudWatchClient = new CloudWatchClient({ ",
      "      region: process.env.VITE_AWS_REGION || 'us-east-1' ",
      "    });",
      "    this.xRayClient = new XRayClient({ ",
      "      region: process.env.VITE_AWS_REGION || 'us-east-1' ",
      "    });",
      "    this.applicationName = 'GameDin';",
      "    this.environment = process.env.VITE_APP_ENV || 'production';",
      "  }",
      "",
      "  /**",
      "   * Record custom metric",
      "   */",
      "  async recordMetric(metricName: string, value: number, unit: string = 'Count') {",
      "    try {",
      "      const command = new PutMetricDataCommand({",
      "        Namespace: this.applicationName,",
      "        MetricData: [",
      "          {",
      "            MetricName: metricName,",
      "            Dimensions: [",
      "              { Name: 'Environment', Value: this.environment },",
      "              { Name: 'Application', Value: this.applicationName }",
      "            ],",
      "            Value: value,",
      "            Unit: unit,",
      "            Timestamp: new Date()",
      "          }",
      "        ]",
      "      });",
      "",
      "      await this.cloudWatchClient.send(command);",
      "    } catch (error) {",
      "      console.error('Error recording metric:', error);",
      "    }",
      "  }",
      "",
      "  /**",
      "   * Record page load time",
      "   */",
      "  async recordPageLoadTime(loadTime: number) {",
      "    await this.recordMetric('PageLoadTime', loadTime, 'Milliseconds');",
      "  }",
      "",
      "  /**",
      "   * Record user engagement",
      "   */",
      "  async recordUserEngagement(engagement: number) {",
      "    await this.recordMetric('UserEngagement', engagement, 'Count');",
      "  }",
      "",
      "  /**",
      "   * Record error rate",
      "   */",
      "  async recordErrorRate(errorRate: number) {",
      "    await this.recordMetric('ErrorRate', errorRate, 'Percent');",
      "  }",
      "",
      "  /**",
      "   * Start X-Ray trace segment",
      "   */",
      "  async startTrace(segmentName: string) {",
      "    try {",
      "      const traceId = this.generateTraceId();",
      "      const segmentId = this.generateSegmentId();",
      "      ",
      "      const command = new PutTraceSegmentsCommand({",
      "        TraceSegmentDocuments: [",
      "          JSON.stringify({",
      "            id: segmentId,",
      "            trace_id: traceId,",
      "            name: segmentName,",
      "            start_time: Date.now() / 1000,",
      "            in_progress: true",
      "          })",
      "        ]",
      "      });",
      "",
      "      await this.xRayClient.send(command);",
      "      return { traceId, segmentId };",
      "    } catch (error) {",
      "      console.error('Error starting trace:', error);",
      "      return null;",
      "    }",
      "  }",
      "",
      "  /**",
      "   * End X-Ray trace segment",
      "   */",
      "  async endTrace(segmentId: string, error?: Error) {",
      "    try {",
      "      const command = new PutTraceSegmentsCommand({",
      "        TraceSegmentDocuments: [",
      "          JSON.stringify({",
      "            id: segmentId,",
      "            end_time: Date.now() / 1000,",
      "            in_progress: false,",
      "            error: error ? {",
      "              message: error.message,",
      "              type: error.name",
      "            } : undefined",
      "          })",
      "        ]",
      "      });",
      "",
      "      await this.xRayClient.send(command);",
      "    } catch (error) {",
      "      console.error('Error ending trace:', error);",
      "    }",
      "  }",
      "",
      "  private generateTraceId(): string {",
      "    return '1-' + Math.random().toString(16).substr(2, 8) + '-' + ",
      "           Math.random().toString(16).substr(2, 24);",
      "  }",
      "",
      "  private generateSegmentId(): string {",
      "    return Math.random().toString(16).substr(2, 16);",
      "  }",
      "}",
      "",
      "export const awsMonitoring = new AWSMonitoringService();",
      "export default awsMonitoring;"
    ].join('\n');

    fs.writeFileSync(path.join(awsDir, 'monitoring.ts'), monitoringServiceContent);
    
    // Create index file
    const indexFile = `
export { awsMonitoring } from './monitoring';
export { default as awsMonitoring } from './monitoring';
`;

    fs.writeFileSync(path.join(awsDir, 'index.ts'), indexFile);
    
    console.log('✅ Monitoring utilities created successfully');
    
  } catch (error) {
    console.error('❌ Error creating monitoring utilities:', error);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting AWS monitoring setup for GameDin...');
  console.log(\`📍 Region: \${awsConfig.region}\`);
  console.log(\`🏗️ Environment: \${awsConfig.environment}\`);
  
  try {
    await setupCloudWatchDashboard();
    await setupCustomMetrics();
    await setupXRayTracing();
    createMonitoringUtilities();
    
    console.log('✅ AWS monitoring setup completed successfully!');
    console.log('📊 Dashboard: https://console.aws.amazon.com/cloudwatch/home');
    console.log('🔍 X-Ray: https://console.aws.amazon.com/xray/home');
    
  } catch (error) {
    console.error('❌ AWS monitoring setup failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  setupCloudWatchDashboard,
  setupCustomMetrics,
  setupXRayTracing,
  createMonitoringUtilities
}; 
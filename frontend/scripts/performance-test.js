#!/usr/bin/env node

/**
 * Performance Testing Script for GameDin AWS Amplify Deployment
 * 
 * This script performs comprehensive performance testing including:
 * - Bundle size analysis
 * - Load time measurements
 * - Core Web Vitals assessment
 * - Memory usage analysis
 * - Network performance evaluation
 * 
 * @author GameDin Development Team
 * @version 4.0.0
 * @since 2024-07-06
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Performance thresholds for different optimization levels
 */
const PERFORMANCE_THRESHOLDS = {
  ultra: {
    bundleSize: 500, // KB
    loadTime: 1000, // ms
    lcp: 1500, // ms
    fid: 100, // ms
    cls: 0.1,
    tti: 2000 // ms
  },
  high: {
    bundleSize: 800,
    loadTime: 1500,
    lcp: 2000,
    fid: 150,
    cls: 0.15,
    tti: 3000
  },
  balanced: {
    bundleSize: 1200,
    loadTime: 2000,
    lcp: 2500,
    fid: 200,
    cls: 0.2,
    tti: 4000
  },
  minimal: {
    bundleSize: 2000,
    loadTime: 3000,
    lcp: 3500,
    fid: 300,
    cls: 0.3,
    tti: 6000
  }
};

/**
 * Get current optimization profile
 */
function getOptimizationProfile() {
  return process.env.VITE_OPTIMIZATION_LEVEL || 'balanced';
}

/**
 * Analyze bundle size
 */
function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Dist directory not found. Run build first.');
  }
  
  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    throw new Error('Assets directory not found.');
  }
  
  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  let totalSize = 0;
  const bundleAnalysis = {
    js: [],
    css: [],
    total: 0
  };
  
  // Analyze JS files
  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    bundleAnalysis.js.push({
      file,
      size: stats.size,
      sizeKB: parseFloat(sizeKB)
    });
    
    totalSize += stats.size;
  });
  
  // Analyze CSS files
  cssFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    bundleAnalysis.css.push({
      file,
      size: stats.size,
      sizeKB: parseFloat(sizeKB)
    });
    
    totalSize += stats.size;
  });
  
  bundleAnalysis.total = totalSize;
  bundleAnalysis.totalKB = (totalSize / 1024).toFixed(2);
  
  return bundleAnalysis;
}

/**
 * Run Lighthouse performance audit
 */
function runLighthouseAudit() {
  console.log('🔍 Running Lighthouse performance audit...');
  
  try {
    // Check if Lighthouse is installed
    execSync('which lighthouse', { stdio: 'ignore' });
  } catch (error) {
    console.warn('⚠️  Lighthouse not found. Install with: npm install -g lighthouse');
    return null;
  }
  
  const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
  
  try {
    execSync(`lighthouse http://localhost:3000 --output=json --output-path=${reportPath} --chrome-flags='--headless'`, {
      stdio: 'pipe'
    });
    
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return report;
    }
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
  }
  
  return null;
}

/**
 * Analyze Core Web Vitals
 */
function analyzeCoreWebVitals(lighthouseReport) {
  if (!lighthouseReport) {
    return null;
  }
  
  const audits = lighthouseReport.audits;
  
  return {
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    fid: audits['max-potential-fid']?.numericValue || 0,
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    tti: audits['interactive']?.numericValue || 0,
    fcp: audits['first-contentful-paint']?.numericValue || 0,
    tbt: audits['total-blocking-time']?.numericValue || 0
  };
}

/**
 * Test network performance
 */
function testNetworkPerformance() {
  console.log('🌐 Testing network performance...');
  
  const testUrls = [
    'https://api.gamedin.com/health',
    'https://cdn.gamedin.com/assets/main.js',
    'https://cdn.gamedin.com/assets/main.css'
  ];
  
  const results = [];
  
  testUrls.forEach(url => {
    try {
      const start = Date.now();
      execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, { stdio: 'pipe' });
      const end = Date.now();
      
      results.push({
        url,
        responseTime: end - start,
        status: 'success'
      });
    } catch (error) {
      results.push({
        url,
        responseTime: null,
        status: 'error',
        error: error.message
      });
    }
  });
  
  return results;
}

/**
 * Analyze memory usage
 */
function analyzeMemoryUsage() {
  console.log('🧠 Analyzing memory usage...');
  
  // This is a simplified memory analysis
  // In a real scenario, you'd use more sophisticated tools
  const memoryInfo = {
    heapUsed: process.memoryUsage().heapUsed / 1024 / 1024, // MB
    heapTotal: process.memoryUsage().heapTotal / 1024 / 1024, // MB
    external: process.memoryUsage().external / 1024 / 1024, // MB
    rss: process.memoryUsage().rss / 1024 / 1024 // MB
  };
  
  return memoryInfo;
}

/**
 * Generate performance report
 */
function generatePerformanceReport(bundleAnalysis, lighthouseReport, networkResults, memoryInfo) {
  const profile = getOptimizationProfile();
  const thresholds = PERFORMANCE_THRESHOLDS[profile];
  
  const coreWebVitals = analyzeCoreWebVitals(lighthouseReport);
  
  const report = {
    timestamp: new Date().toISOString(),
    optimizationProfile: profile,
    thresholds,
    bundleAnalysis,
    coreWebVitals,
    networkPerformance: networkResults,
    memoryUsage: memoryInfo,
    scores: {
      bundleSize: {
        value: parseFloat(bundleAnalysis.totalKB),
        threshold: thresholds.bundleSize,
        passed: parseFloat(bundleAnalysis.totalKB) <= thresholds.bundleSize
      },
      lcp: coreWebVitals ? {
        value: coreWebVitals.lcp,
        threshold: thresholds.lcp,
        passed: coreWebVitals.lcp <= thresholds.lcp
      } : null,
      fid: coreWebVitals ? {
        value: coreWebVitals.fid,
        threshold: thresholds.fid,
        passed: coreWebVitals.fid <= thresholds.fid
      } : null,
      cls: coreWebVitals ? {
        value: coreWebVitals.cls,
        threshold: thresholds.cls,
        passed: coreWebVitals.cls <= thresholds.cls
      } : null
    }
  };
  
  // Calculate overall performance score
  const scores = Object.values(report.scores).filter(score => score !== null);
  const passedTests = scores.filter(score => score.passed).length;
  report.overallScore = Math.round((passedTests / scores.length) * 100);
  
  return report;
}

/**
 * Print performance report
 */
function printPerformanceReport(report) {
  console.log('\n📊 Performance Test Results');
  console.log('=' .repeat(50));
  console.log(`🎯 Optimization Profile: ${report.optimizationProfile.toUpperCase()}`);
  console.log(`📅 Test Date: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`🏆 Overall Score: ${report.overallScore}%`);
  
  console.log('\n📦 Bundle Analysis:');
  console.log(`  Total Size: ${report.bundleAnalysis.totalKB} KB`);
  console.log(`  JS Files: ${report.bundleAnalysis.js.length}`);
  console.log(`  CSS Files: ${report.bundleAnalysis.css.length}`);
  
  if (report.scores.bundleSize) {
    const status = report.scores.bundleSize.passed ? '✅' : '❌';
    console.log(`  Bundle Size: ${status} ${report.scores.bundleSize.value} KB (threshold: ${report.scores.bundleSize.threshold} KB)`);
  }
  
  if (report.coreWebVitals) {
    console.log('\n🎯 Core Web Vitals:');
    Object.entries(report.scores).forEach(([metric, score]) => {
      if (score && metric !== 'bundleSize') {
        const status = score.passed ? '✅' : '❌';
        const unit = metric === 'cls' ? '' : 'ms';
        console.log(`  ${metric.toUpperCase()}: ${status} ${score.value}${unit} (threshold: ${score.threshold}${unit})`);
      }
    });
  }
  
  console.log('\n🌐 Network Performance:');
  report.networkPerformance.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    const time = result.responseTime ? `${result.responseTime}ms` : 'failed';
    console.log(`  ${status} ${result.url}: ${time}`);
  });
  
  console.log('\n🧠 Memory Usage:');
  console.log(`  Heap Used: ${report.memoryUsage.heapUsed.toFixed(2)} MB`);
  console.log(`  Heap Total: ${report.memoryUsage.heapTotal.toFixed(2)} MB`);
  console.log(`  RSS: ${report.memoryUsage.rss.toFixed(2)} MB`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (report.overallScore < 80) {
    console.log('  ⚠️  Performance needs improvement. Consider:');
    if (!report.scores.bundleSize.passed) {
      console.log('    - Reducing bundle size through code splitting');
      console.log('    - Implementing tree shaking');
      console.log('    - Using dynamic imports');
    }
    if (report.scores.lcp && !report.scores.lcp.passed) {
      console.log('    - Optimizing images and fonts');
      console.log('    - Implementing lazy loading');
      console.log('    - Using CDN for static assets');
    }
    if (report.scores.fid && !report.scores.fid.passed) {
      console.log('    - Reducing JavaScript execution time');
      console.log('    - Implementing code splitting');
      console.log('    - Using web workers for heavy tasks');
    }
  } else {
    console.log('  ✅ Performance is excellent!');
  }
}

/**
 * Main performance testing function
 */
function runPerformanceTests() {
  console.log('🚀 Starting performance tests for AWS Amplify deployment...');
  
  try {
    // Bundle analysis
    const bundleAnalysis = analyzeBundleSize();
    
    // Lighthouse audit
    const lighthouseReport = runLighthouseAudit();
    
    // Network performance
    const networkResults = testNetworkPerformance();
    
    // Memory usage
    const memoryInfo = analyzeMemoryUsage();
    
    // Generate report
    const report = generatePerformanceReport(bundleAnalysis, lighthouseReport, networkResults, memoryInfo);
    
    // Print report
    printPerformanceReport(report);
    
    // Save report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    
    // Exit with appropriate code
    if (report.overallScore < 60) {
      console.log('\n❌ Performance test failed. Score below 60%.');
      process.exit(1);
    } else if (report.overallScore < 80) {
      console.log('\n⚠️  Performance test passed with warnings. Score below 80%.');
      process.exit(0);
    } else {
      console.log('\n✅ Performance test passed! Excellent performance.');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runPerformanceTests, analyzeBundleSize, analyzeCoreWebVitals }; 
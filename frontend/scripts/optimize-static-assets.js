#!/usr/bin/env node

/**
 * Static Asset Optimization Script for GameDin CloudFront CDN
 * 
 * This script optimizes static assets for optimal CloudFront CDN delivery
 * including image optimization, compression, and caching strategies.
 * 
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  publicDir: path.join(__dirname, '../public'),
  distDir: path.join(__dirname, '../dist'),
  optimizationConfig: {
    images: {
      formats: ['webp', 'avif'],
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080
    },
    compression: {
      gzip: true,
      brotli: true,
      threshold: 1024
    },
    caching: {
      js: '1 year',
      css: '1 year',
      images: '30 days',
      fonts: '1 year',
      html: 'no-cache'
    }
  }
};

/**
 * Optimize images for CloudFront CDN
 */
function optimizeImages() {
  try {
    console.log('🖼️ Optimizing images for CloudFront CDN...');
    
    const imageDir = path.join(config.publicDir, 'images');
    if (!fs.existsSync(imageDir)) {
      console.log('⚠️  Images directory not found');
      return;
    }

    const imageFiles = fs.readdirSync(imageDir).filter(file => 
      /\.(png|jpg|jpeg|gif|svg)$/i.test(file)
    );

    let totalOptimized = 0;
    let totalSizeReduction = 0;

    imageFiles.forEach(file => {
      const filePath = path.join(imageDir, file);
      const stats = fs.statSync(filePath);
      const originalSize = stats.size;

      // Generate WebP version
      if (/\.(png|jpg|jpeg|gif)$/i.test(file)) {
        const webpPath = filePath.replace(/\.[^/.]+$/, '.webp');
        try {
          execSync(`cwebp -q ${config.optimizationConfig.images.quality} "${filePath}" -o "${webpPath}"`, { stdio: 'pipe' });
          const webpStats = fs.statSync(webpPath);
          const sizeReduction = originalSize - webpStats.size;
          totalSizeReduction += sizeReduction;
          totalOptimized++;
          console.log(`  ✅ ${file} -> ${(sizeReduction / 1024).toFixed(2)} KB saved`);
        } catch (error) {
          console.log(`  ⚠️  Failed to optimize ${file}: ${error.message}`);
        }
      }
    });

    console.log(`✅ Image optimization completed: ${totalOptimized} files optimized, ${(totalSizeReduction / 1024).toFixed(2)} KB saved`);
    return { totalOptimized, totalSizeReduction };
    
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    return null;
  }
}

/**
 * Optimize fonts for CloudFront CDN
 */
function optimizeFonts() {
  try {
    console.log('🔤 Optimizing fonts for CloudFront CDN...');
    
    const fontDir = path.join(config.publicDir, 'fonts');
    if (!fs.existsSync(fontDir)) {
      console.log('⚠️  Fonts directory not found');
      return;
    }

    const fontFiles = fs.readdirSync(fontDir).filter(file => 
      /\.(woff|woff2|ttf|eot)$/i.test(file)
    );

    let totalOptimized = 0;
    let totalSizeReduction = 0;

    fontFiles.forEach(file => {
      const filePath = path.join(fontDir, file);
      const stats = fs.statSync(filePath);
      const originalSize = stats.size;

      // Convert to WOFF2 if not already
      if (/\.(ttf|otf)$/i.test(file) && !file.endsWith('.woff2')) {
        const woff2Path = filePath.replace(/\.[^/.]+$/, '.woff2');
        try {
          execSync(`woff2_compress "${filePath}"`, { stdio: 'pipe' });
          if (fs.existsSync(woff2Path)) {
            const woff2Stats = fs.statSync(woff2Path);
            const sizeReduction = originalSize - woff2Stats.size;
            totalSizeReduction += sizeReduction;
            totalOptimized++;
            console.log(`  ✅ ${file} -> ${(sizeReduction / 1024).toFixed(2)} KB saved`);
          }
        } catch (error) {
          console.log(`  ⚠️  Failed to optimize ${file}: ${error.message}`);
        }
      }
    });

    console.log(`✅ Font optimization completed: ${totalOptimized} files optimized, ${(totalSizeReduction / 1024).toFixed(2)} KB saved`);
    return { totalOptimized, totalSizeReduction };
    
  } catch (error) {
    console.error('❌ Error optimizing fonts:', error);
    return null;
  }
}

/**
 * Apply compression to static assets
 */
function applyCompression() {
  try {
    console.log('🗜️ Applying compression to static assets...');
    
    if (!fs.existsSync(config.distDir)) {
      console.log('⚠️  Dist directory not found. Run build first.');
      return;
    }

    const compressibleFiles = [];
    
    // Find all compressible files
    function findCompressibleFiles(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          findCompressibleFiles(filePath);
        } else if (/\.(js|css|html|json|xml|txt)$/i.test(file) && stats.size > config.optimizationConfig.compression.threshold) {
          compressibleFiles.push(filePath);
        }
      });
    }

    findCompressibleFiles(config.distDir);

    let totalCompressed = 0;
    let totalSizeReduction = 0;

    compressibleFiles.forEach(filePath => {
      const stats = fs.statSync(filePath);
      const originalSize = stats.size;

      // Apply gzip compression
      if (config.optimizationConfig.compression.gzip) {
        try {
          execSync(`gzip -9 -c "${filePath}" > "${filePath}.gz"`, { stdio: 'pipe' });
          const gzipStats = fs.statSync(`${filePath}.gz`);
          const gzipReduction = originalSize - gzipStats.size;
          totalSizeReduction += gzipReduction;
          console.log(`  ✅ ${path.basename(filePath)}.gz -> ${(gzipReduction / 1024).toFixed(2)} KB saved`);
        } catch (error) {
          console.log(`  ⚠️  Failed to gzip ${path.basename(filePath)}: ${error.message}`);
        }
      }

      // Apply brotli compression
      if (config.optimizationConfig.compression.brotli) {
        try {
          execSync(`brotli -9 "${filePath}"`, { stdio: 'pipe' });
          const brotliStats = fs.statSync(`${filePath}.br`);
          const brotliReduction = originalSize - brotliStats.size;
          totalSizeReduction += brotliReduction;
          console.log(`  ✅ ${path.basename(filePath)}.br -> ${(brotliReduction / 1024).toFixed(2)} KB saved`);
        } catch (error) {
          console.log(`  ⚠️  Failed to brotli ${path.basename(filePath)}: ${error.message}`);
        }
      }

      totalCompressed++;
    });

    console.log(`✅ Compression completed: ${totalCompressed} files compressed, ${(totalSizeReduction / 1024).toFixed(2)} KB saved`);
    return { totalCompressed, totalSizeReduction };
    
  } catch (error) {
    console.error('❌ Error applying compression:', error);
    return null;
  }
}

/**
 * Generate CloudFront cache headers configuration
 */
function generateCacheHeaders() {
  try {
    console.log('📋 Generating CloudFront cache headers configuration...');
    
    const cacheConfig = {
      cacheBehaviors: [
        {
          pathPattern: '*.js',
          cachePolicy: {
            ttl: 31536000, // 1 year
            headers: ['Accept-Encoding'],
            queryStrings: false,
            cookies: 'none'
          }
        },
        {
          pathPattern: '*.css',
          cachePolicy: {
            ttl: 31536000, // 1 year
            headers: ['Accept-Encoding'],
            queryStrings: false,
            cookies: 'none'
          }
        },
        {
          pathPattern: '*.{png,jpg,jpeg,gif,svg,webp,avif}',
          cachePolicy: {
            ttl: 2592000, // 30 days
            headers: ['Accept-Encoding'],
            queryStrings: false,
            cookies: 'none'
          }
        },
        {
          pathPattern: '*.{woff,woff2,ttf,eot}',
          cachePolicy: {
            ttl: 31536000, // 1 year
            headers: ['Accept-Encoding'],
            queryStrings: false,
            cookies: 'none'
          }
        },
        {
          pathPattern: '/assets/*',
          cachePolicy: {
            ttl: 31536000, // 1 year
            headers: ['Accept-Encoding'],
            queryStrings: false,
            cookies: 'none'
          }
        },
        {
          pathPattern: '/api/*',
          cachePolicy: {
            ttl: 0, // No cache
            headers: ['Authorization', 'X-Requested-With', 'X-API-Key'],
            queryStrings: true,
            cookies: 'all'
          }
        }
      ]
    };

    const configPath = path.join(__dirname, '../cloudfront-cache-config.json');
    fs.writeFileSync(configPath, JSON.stringify(cacheConfig, null, 2));
    
    console.log('✅ CloudFront cache headers configuration generated');
    return cacheConfig;
    
  } catch (error) {
    console.error('❌ Error generating cache headers:', error);
    return null;
  }
}

/**
 * Create asset optimization report
 */
function generateOptimizationReport(imageResults, fontResults, compressionResults, cacheConfig) {
  try {
    console.log('📊 Generating asset optimization report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      optimization: {
        images: imageResults || { totalOptimized: 0, totalSizeReduction: 0 },
        fonts: fontResults || { totalOptimized: 0, totalSizeReduction: 0 },
        compression: compressionResults || { totalCompressed: 0, totalSizeReduction: 0 }
      },
      cacheConfig,
      summary: {
        totalSizeReduction: (imageResults?.totalSizeReduction || 0) + 
                           (fontResults?.totalSizeReduction || 0) + 
                           (compressionResults?.totalSizeReduction || 0),
        totalFilesOptimized: (imageResults?.totalOptimized || 0) + 
                            (fontResults?.totalOptimized || 0) + 
                            (compressionResults?.totalCompressed || 0)
      }
    };

    const reportPath = path.join(__dirname, '../static-asset-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ Asset optimization report generated');
    return report;
    
  } catch (error) {
    console.error('❌ Error generating optimization report:', error);
    return null;
  }
}

/**
 * Display optimization summary
 */
function displayOptimizationSummary(report) {
  console.log('\n📦 Static Asset Optimization Summary');
  console.log('====================================');
  console.log(`🖼️ Images Optimized: ${report.optimization.images.totalOptimized}`);
  console.log(`🔤 Fonts Optimized: ${report.optimization.fonts.totalOptimized}`);
  console.log(`🗜️ Files Compressed: ${report.optimization.compression.totalCompressed}`);
  console.log(`📊 Total Files Optimized: ${report.summary.totalFilesOptimized}`);
  console.log(`💾 Total Size Reduction: ${(report.summary.totalSizeReduction / 1024).toFixed(2)} KB`);
  
  console.log('\n☁️ CloudFront Cache Configuration:');
  report.cacheConfig.cacheBehaviors.forEach((behavior, index) => {
    console.log(`  ${index + 1}. ${behavior.pathPattern}: ${behavior.cachePolicy.ttl === 0 ? 'No Cache' : `${behavior.cachePolicy.ttl / 86400} days`}`);
  });
  
  console.log('\n✅ Static asset optimization completed!');
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting static asset optimization for CloudFront CDN...');
  
  try {
    const imageResults = optimizeImages();
    const fontResults = optimizeFonts();
    const compressionResults = applyCompression();
    const cacheConfig = generateCacheHeaders();
    
    const report = generateOptimizationReport(imageResults, fontResults, compressionResults, cacheConfig);
    
    displayOptimizationSummary(report);
    
  } catch (error) {
    console.error('❌ Static asset optimization failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  optimizeImages,
  optimizeFonts,
  applyCompression,
  generateCacheHeaders,
  generateOptimizationReport,
  displayOptimizationSummary
}; 
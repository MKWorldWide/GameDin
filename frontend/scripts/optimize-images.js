#!/usr/bin/env node

/**
 * Image Optimization Script for GameDin AWS Amplify Deployment
 * 
 * This script automatically optimizes images based on the self-selecting
 * optimization profile. It supports multiple formats and quality levels
 * for optimal performance across different devices and networks.
 * 
 * @author GameDin Development Team
 * @version 4.0.0
 * @since 2024-07-06
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Optimization profiles based on device capabilities and network conditions
const OPTIMIZATION_PROFILES = {
  ultra: {
    quality: 95,
    formats: ['webp', 'avif', 'jpeg'],
    sizes: [1920, 1280, 768, 480],
    progressive: true,
    compression: 'advanced'
  },
  high: {
    quality: 85,
    formats: ['webp', 'jpeg'],
    sizes: [1280, 768, 480],
    progressive: true,
    compression: 'advanced'
  },
  balanced: {
    quality: 75,
    formats: ['webp', 'jpeg'],
    sizes: [768, 480],
    progressive: false,
    compression: 'basic'
  },
  minimal: {
    quality: 60,
    formats: ['jpeg'],
    sizes: [480],
    progressive: false,
    compression: 'none'
  }
};

/**
 * Get current optimization profile from environment or default to balanced
 */
function getOptimizationProfile() {
  const env = process.env.VITE_OPTIMIZATION_LEVEL || 'balanced';
  return OPTIMIZATION_PROFILES[env] || OPTIMIZATION_PROFILES.balanced;
}

/**
 * Check if required tools are installed
 */
function checkDependencies() {
  try {
    execSync('which convert', { stdio: 'ignore' });
    execSync('which cwebp', { stdio: 'ignore' });
    execSync('which avifenc', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.warn('⚠️  Some optimization tools not found. Install ImageMagick, WebP, and AVIF tools for full optimization.');
    return false;
  }
}

/**
 * Optimize a single image
 */
function optimizeImage(inputPath, outputDir, profile) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const ext = path.extname(inputPath).toLowerCase();
  
  console.log(`🖼️  Optimizing: ${filename}${ext}`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const optimizedImages = [];
  
  // Generate different sizes
  profile.sizes.forEach(size => {
    const sizeDir = path.join(outputDir, `${size}w`);
    if (!fs.existsSync(sizeDir)) {
      fs.mkdirSync(sizeDir, { recursive: true });
    }
    
    // Generate different formats
    profile.formats.forEach(format => {
      const outputPath = path.join(sizeDir, `${filename}.${format}`);
      
      try {
        switch (format) {
          case 'webp':
            optimizeWebP(inputPath, outputPath, size, profile.quality);
            break;
          case 'avif':
            optimizeAVIF(inputPath, outputPath, size, profile.quality);
            break;
          case 'jpeg':
            optimizeJPEG(inputPath, outputPath, size, profile.quality, profile.progressive);
            break;
        }
        
        optimizedImages.push({
          path: outputPath,
          size,
          format,
          quality: profile.quality
        });
        
        console.log(`  ✅ Generated: ${size}w/${filename}.${format}`);
      } catch (error) {
        console.error(`  ❌ Failed to generate ${format}: ${error.message}`);
      }
    });
  });
  
  return optimizedImages;
}

/**
 * Optimize image to WebP format
 */
function optimizeWebP(inputPath, outputPath, size, quality) {
  const command = `convert "${inputPath}" -resize ${size}x -quality ${quality} -define webp:method=6 -define webp:pass=10 "${outputPath}"`;
  execSync(command, { stdio: 'ignore' });
}

/**
 * Optimize image to AVIF format
 */
function optimizeAVIF(inputPath, outputPath, size, quality) {
  const command = `convert "${inputPath}" -resize ${size}x -quality ${quality} "${outputPath}"`;
  execSync(command, { stdio: 'ignore' });
  
  // Convert to AVIF using avifenc
  const tempPath = outputPath.replace('.avif', '_temp.png');
  fs.renameSync(outputPath, tempPath);
  
  const avifCommand = `avifenc --min 0 --max 63 --minalpha 0 --maxalpha 63 --quality ${quality} "${tempPath}" "${outputPath}"`;
  execSync(avifCommand, { stdio: 'ignore' });
  
  // Clean up temp file
  fs.unlinkSync(tempPath);
}

/**
 * Optimize image to JPEG format
 */
function optimizeJPEG(inputPath, outputPath, size, quality, progressive) {
  const progressiveFlag = progressive ? '-interlace Plane' : '';
  const command = `convert "${inputPath}" -resize ${size}x -quality ${quality} ${progressiveFlag} "${outputPath}"`;
  execSync(command, { stdio: 'ignore' });
}

/**
 * Generate responsive image markup
 */
function generateResponsiveMarkup(optimizedImages, originalPath) {
  const filename = path.basename(originalPath, path.extname(originalPath));
  
  // Group by format
  const formatGroups = {};
  optimizedImages.forEach(img => {
    if (!formatGroups[img.format]) {
      formatGroups[img.format] = [];
    }
    formatGroups[img.format].push(img);
  });
  
  // Generate picture element markup
  let markup = '<picture>\n';
  
  // Add AVIF source if available
  if (formatGroups.avif) {
    markup += '  <source\n';
    markup += '    type="image/avif"\n';
    markup += '    srcset="';
    markup += formatGroups.avif.map(img => `${img.path} ${img.size}w`).join(', ');
    markup += '"\n';
    markup += '    sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1280px"\n';
    markup += '  />\n';
  }
  
  // Add WebP source if available
  if (formatGroups.webp) {
    markup += '  <source\n';
    markup += '    type="image/webp"\n';
    markup += '    srcset="';
    markup += formatGroups.webp.map(img => `${img.path} ${img.size}w`).join(', ');
    markup += '"\n';
    markup += '    sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1280px"\n';
    markup += '  />\n';
  }
  
  // Add fallback JPEG
  if (formatGroups.jpeg) {
    const fallback = formatGroups.jpeg.find(img => img.size === 768) || formatGroups.jpeg[0];
    markup += `  <img src="${fallback.path}" alt="${filename}" loading="lazy" />\n`;
  }
  
  markup += '</picture>';
  
  return markup;
}

/**
 * Main optimization function
 */
function optimizeImages() {
  console.log('🚀 Starting image optimization for AWS Amplify deployment...');
  
  const profile = getOptimizationProfile();
  console.log(`📊 Using optimization profile: ${process.env.VITE_OPTIMIZATION_LEVEL || 'balanced'}`);
  console.log(`🎯 Quality: ${profile.quality}%, Formats: ${profile.formats.join(', ')}, Sizes: ${profile.sizes.join(', ')}w`);
  
  // Check dependencies
  const hasTools = checkDependencies();
  if (!hasTools) {
    console.log('⚠️  Proceeding with basic optimization only...');
  }
  
  const inputDir = path.join(process.cwd(), 'public', 'images');
  const outputDir = path.join(process.cwd(), 'dist', 'images', 'optimized');
  
  if (!fs.existsSync(inputDir)) {
    console.log('📁 No images directory found. Skipping image optimization.');
    return;
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Find all images
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
  const images = [];
  
  function findImages(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findImages(filePath);
      } else if (imageExtensions.includes(path.extname(file).toLowerCase())) {
        images.push(filePath);
      }
    });
  }
  
  findImages(inputDir);
  
  if (images.length === 0) {
    console.log('📁 No images found to optimize.');
    return;
  }
  
  console.log(`📸 Found ${images.length} images to optimize...`);
  
  const optimizationResults = [];
  
  // Optimize each image
  images.forEach(imagePath => {
    try {
      const optimized = optimizeImage(imagePath, outputDir, profile);
      optimizationResults.push({
        original: imagePath,
        optimized,
        markup: generateResponsiveMarkup(optimized, imagePath)
      });
    } catch (error) {
      console.error(`❌ Failed to optimize ${imagePath}: ${error.message}`);
    }
  });
  
  // Generate optimization report
  const report = {
    timestamp: new Date().toISOString(),
    profile: process.env.VITE_OPTIMIZATION_LEVEL || 'balanced',
    totalImages: images.length,
    optimizedImages: optimizationResults.length,
    results: optimizationResults
  };
  
  // Save report
  const reportPath = path.join(outputDir, 'optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markup file for easy copy-paste
  const markupPath = path.join(outputDir, 'responsive-markup.html');
  const markupContent = optimizationResults.map(result => {
    const filename = path.basename(result.original);
    return `<!-- ${filename} -->\n${result.markup}\n`;
  }).join('\n');
  
  fs.writeFileSync(markupPath, markupContent);
  
  console.log(`✅ Image optimization completed!`);
  console.log(`📊 Optimized ${optimizationResults.length}/${images.length} images`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`📝 Markup saved: ${markupPath}`);
  
  // Calculate size savings
  let originalSize = 0;
  let optimizedSize = 0;
  
  optimizationResults.forEach(result => {
    const originalStat = fs.statSync(result.original);
    originalSize += originalStat.size;
    
    result.optimized.forEach(img => {
      if (fs.existsSync(img.path)) {
        const optimizedStat = fs.statSync(img.path);
        optimizedSize += optimizedStat.size;
      }
    });
  });
  
  const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
  console.log(`💾 Size savings: ${savings}% (${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB)`);
}

// Run optimization if called directly
if (require.main === module) {
  optimizeImages();
}

module.exports = { optimizeImages, getOptimizationProfile }; 
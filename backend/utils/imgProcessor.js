//Image manipulation functions

// utils/imageProcessor.js
// Utility functions for image processing and manipulation

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ==================== RESIZE IMAGE ====================
// Resizes image to specified dimensions
const resizeImage = async (inputPath, outputPath, width, height) => {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true // Don't upscale small images
      })
      .toFile(outputPath);
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Resize error:', error);
    throw new Error('Failed to resize image');
  }
};

// ==================== COMPRESS IMAGE ====================
// Compresses image to reduce file size
const compressImage = async (inputPath, outputPath, quality = 80) => {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // Choose format based on original
    if (metadata.format === 'png') {
      await sharp(inputPath)
        .png({ quality, compressionLevel: 9 })
        .toFile(outputPath);
    } else {
      await sharp(inputPath)
        .jpeg({ quality, progressive: true })
        .toFile(outputPath);
    }
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Failed to compress image');
  }
};

// ==================== CREATE THUMBNAIL ====================
// Creates a small thumbnail version
const createThumbnail = async (inputPath, outputPath, size = 200) => {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover', // Crop to square
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toFile(outputPath);
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Thumbnail error:', error);
    throw new Error('Failed to create thumbnail');
  }
};

// ==================== CONVERT FORMAT ====================
// Converts image to different format
const convertFormat = async (inputPath, outputPath, format = 'jpeg') => {
  try {
    const converter = sharp(inputPath);
    
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        await converter.jpeg({ quality: 85 }).toFile(outputPath);
        break;
      case 'png':
        await converter.png({ quality: 85 }).toFile(outputPath);
        break;
      case 'webp':
        await converter.webp({ quality: 85 }).toFile(outputPath);
        break;
      default:
        throw new Error('Unsupported format');
    }
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Conversion error:', error);
    throw new Error('Failed to convert image format');
  }
};

// ==================== ADD WATERMARK ====================
// Adds a watermark to image (optional feature)
const addWatermark = async (inputPath, outputPath, watermarkText) => {
  try {
    const svgText = `
      <svg width="500" height="100">
        <text x="50%" y="50%" 
              text-anchor="middle" 
              font-size="30" 
              fill="white" 
              opacity="0.5">${watermarkText}</text>
      </svg>
    `;
    
    const watermarkBuffer = Buffer.from(svgText);
    
    await sharp(inputPath)
      .composite([{
        input: watermarkBuffer,
        gravity: 'southeast'
      }])
      .toFile(outputPath);
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Watermark error:', error);
    throw new Error('Failed to add watermark');
  }
};

// ==================== GET IMAGE METADATA ====================
// Gets information about an image
const getImageInfo = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation
    };
  } catch (error) {
    console.error('Metadata error:', error);
    throw new Error('Failed to get image info');
  }
};

// ==================== OPTIMIZE IMAGE FOR WEB ====================
// Full optimization pipeline for web use
const optimizeForWeb = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 85,
      format = 'jpeg'
    } = options;
    
    const processor = sharp(inputPath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    
    // Apply format-specific optimization
    if (format === 'jpeg' || format === 'jpg') {
      processor.jpeg({ 
        quality, 
        progressive: true,
        mozjpeg: true 
      });
    } else if (format === 'png') {
      processor.png({ 
        quality, 
        compressionLevel: 9 
      });
    } else if (format === 'webp') {
      processor.webp({ quality });
    }
    
    await processor.toFile(outputPath);
    
    // Get file sizes for comparison
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    return {
      success: true,
      path: outputPath,
      originalSize,
      optimizedSize,
      savings: `${savings}%`
    };
  } catch (error) {
    console.error('Optimization error:', error);
    throw new Error('Failed to optimize image');
  }
};

// ==================== DELETE IMAGE ====================
// Safely deletes an image file
const deleteImage = async (imagePath) => {
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return { success: true, message: 'Image deleted' };
    }
    return { success: false, message: 'Image not found' };
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// ==================== BATCH PROCESS IMAGES ====================
// Process multiple images at once
const batchProcess = async (inputPaths, outputDir, options = {}) => {
  try {
    const results = [];
    
    for (const inputPath of inputPaths) {
      const filename = path.basename(inputPath);
      const outputPath = path.join(outputDir, `processed-${filename}`);
      
      const result = await optimizeForWeb(inputPath, outputPath, options);
      results.push({
        original: inputPath,
        processed: outputPath,
        ...result
      });
    }
    
    return results;
  } catch (error) {
    console.error('Batch process error:', error);
    throw new Error('Failed to batch process images');
  }
};

// ==================== EXPORT ALL FUNCTIONS ====================
module.exports = {
  resizeImage,
  compressImage,
  createThumbnail,
  convertFormat,
  addWatermark,
  getImageInfo,
  optimizeForWeb,
  deleteImage,
  batchProcess
};

// HOW TO USE IN CONTROLLER:
// const { optimizeForWeb, createThumbnail } = require('../utils/imageProcessor');
// 
// const result = await optimizeForWeb(inputPath, outputPath, {
//   maxWidth: 800,
//   quality: 85,
//   format: 'jpeg'
// });
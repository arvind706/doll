//Logic for handling uploads

// controllers/upload.controller.js
// This file handles image upload and processing

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ==================== UPLOAD SINGLE IMAGE ====================
// POST /api/upload
exports.uploadImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded. Please select an image.' 
      });
    }
    
    console.log('📤 File received:', req.file.filename);
    
    const originalPath = req.file.path;
    const processedFileName = `processed-${Date.now()}-${req.file.filename}`;
    const processedPath = path.join('uploads', processedFileName);
    
    // Process image with Sharp
    await sharp(originalPath)
      .resize(800, 800, { 
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true // Don't make small images bigger
      })
      .jpeg({ 
        quality: 85, // Good quality
        progressive: true 
      })
      .toFile(processedPath);
    
    console.log('✅ Image processed:', processedFileName);
    
    // Delete original unprocessed file to save space
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
      console.log('🗑️ Original file deleted');
    }
    
    // Generate URL for the processed image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${processedFileName}`;
    
    // Send success response
    res.status(200).json({
      message: 'Image uploaded and processed successfully',
      imageUrl: imageUrl,
      filename: processedFileName,
      originalName: req.file.originalname,
      size: req.file.size
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up files if processing fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Failed to process image', 
      error: error.message 
    });
  }
};

// ==================== UPLOAD MULTIPLE IMAGES (Optional) ====================
// POST /api/upload/multiple
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'No files uploaded' 
      });
    }
    
    const processedImages = [];
    
    // Process each uploaded image
    for (const file of req.files) {
      const originalPath = file.path;
      const processedFileName = `processed-${Date.now()}-${file.filename}`;
      const processedPath = path.join('uploads', processedFileName);
      
      await sharp(originalPath)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(processedPath);
      
      // Delete original
      fs.unlinkSync(originalPath);
      
      // Generate URL
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${processedFileName}`;
      
      processedImages.push({
        imageUrl,
        filename: processedFileName,
        originalName: file.originalname
      });
    }
    
    res.json({
      message: `${processedImages.length} images uploaded successfully`,
      images: processedImages
    });
    
  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to process images', 
      error: error.message 
    });
  }
};

// ==================== DELETE IMAGE (Optional) ====================
// DELETE /api/upload/:filename
exports.deleteImage = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: 'Image not found' 
      });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    res.json({
      message: 'Image deleted successfully',
      filename: filename
    });
    
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      message: 'Failed to delete image', 
      error: error.message 
    });
  }
};
// routes/upload.routes.js
// This file handles image upload endpoint

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');

// ==================== ROUTES ====================

// UPLOAD single image
// URL: POST http://localhost:5000/api/upload
// Body: FormData with 'image' field
// The 'image' must match the field name from frontend FormData.append('image', file)
router.post('/', upload.single('image'), uploadController.uploadImage);

// Optional: Upload multiple images
// URL: POST http://localhost:5000/api/upload/multiple
// Body: FormData with 'images' field (multiple files)
// router.post('/multiple', upload.array('images', 5), uploadController.uploadMultiple);

// ==================== EXPORT ====================
module.exports = router;

// HOW THIS WORKS:
// 1. Frontend sends FormData with image file
// 2. Multer middleware (upload.single('image')) intercepts the request
// 3. Multer saves the file to 'uploads/' folder
// 4. Multer adds file info to req.file
// 5. uploadController.uploadImage() processes the file
// 6. Sharp resizes and optimizes the image
// 7. Controller returns the image URL to frontend

// IMPORTANT: The string 'image' in upload.single('image') MUST match 
// the field name in your frontend FormData:
// formData.append('image', file);  ← This 'image' must match!
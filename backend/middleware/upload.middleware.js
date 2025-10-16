//Multer configuration for file uploads

// middleware/upload.middleware.js
// Configures Multer for handling file uploads

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== ENSURE UPLOADS FOLDER EXISTS ====================
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// ==================== STORAGE CONFIGURATION ====================
const storage = multer.diskStorage({
  // Where to store files
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  
  // How to name files
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-randomnumber-originalname.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// ==================== FILE FILTER (Only allow images) ====================
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  // Check mime type
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`), false);
  }
  
  // Also check extension as extra security
  const allowedExts = /jpeg|jpg|png|gif|webp/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  
  if (!extname) {
    cb(new Error('Invalid file extension'), false);
  }
};

// ==================== CREATE MULTER INSTANCE ====================
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Max 1 file per upload
  },
  fileFilter: fileFilter
});

// ==================== ERROR HANDLING WRAPPER ====================
// This catches Multer errors and formats them nicely
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 1 file allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field name. Use "image" as field name.'
      });
    }
    
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }
  
  // Other errors (like file type errors)
  if (err) {
    return res.status(400).json({
      message: err.message || 'File upload failed'
    });
  }
  
  next();
};

// ==================== EXPORT ====================
module.exports = upload;
module.exports.handleMulterError = handleMulterError;

// HOW TO USE:
// In routes: upload.single('image')
// In server.js: app.use(handleMulterError) after routes
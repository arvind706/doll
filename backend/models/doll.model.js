// Database schema/structure for dolls

// models/Doll.model.js
// This defines the structure/schema of a doll in MongoDB

const mongoose = require('mongoose');

// Define what fields a doll has
const dollSchema = new mongoose.Schema({
  // Doll's name (required)
  name: {
    type: String,
    required: [true, 'Doll name is required'],
    trim: true, // Removes extra spaces
    minlength: [1, 'Name must be at least 1 character'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  // Doll's color (hex code)
  color: {
    type: String,
    required: true,
    default: '#ff0000', // Red by default
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
  },
  
  // Doll's size (1-100)
  size: {
    type: Number,
    required: true,
    min: [1, 'Size must be at least 1'],
    max: [100, 'Size cannot exceed 100'],
    default: 50
  },
  
  // URL to uploaded image (optional)
  imageUrl: {
    type: String,
    default: null
  },
  
  // Array of pins placed on the doll
  pins: [{
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      default: '#ff0000'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the model from schema
const Doll = mongoose.model('Doll', dollSchema);

module.exports = Doll;

// EXAMPLE of what a doll looks like in database:
// {
//   _id: "67a1b2c3d4e5f6g7h8i9j0k1",
//   name: "Test Doll",
//   color: "#ff0000",
//   size: 50,
//   imageUrl: "http://localhost:5000/uploads/processed-123456.jpg",
//   pins: [
//     { x: 100, y: 200, color: "#ff0000", timestamp: "2025-10-06T..." }
//   ],
//   createdAt: "2025-10-06T10:30:00.000Z",
//   updatedAt: "2025-10-06T10:30:00.000Z"
// }
//Business logic for doll operations

// controllers/doll.controller.js
// This file contains all the business logic for doll operations

const Doll = require('../models/doll.model');

// ==================== CREATE NEW DOLL ====================
// POST /api/dolls
exports.createDoll = async (req, res) => {
  try {
    // Get data from request body
    const { name, color, size, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || !color || !size) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, color, and size are required' 
      });
    }
    
    // Create new doll instance
    const doll = new Doll({
      name,
      color,
      size,
      imageUrl: imageUrl || null
    });
    
    // Save to database
    const savedDoll = await doll.save();
    
    // Send success response
    res.status(201).json({
      message: 'Doll created successfully',
      doll: savedDoll
    });
    
  } catch (error) {
    console.error('Create doll error:', error);
    res.status(400).json({ 
      message: 'Failed to create doll', 
      error: error.message 
    });
  }
};

// ==================== GET ALL DOLLS ====================
// GET /api/dolls
exports.getAllDolls = async (req, res) => {
  try {
    // Find all dolls, sort by newest first
    const dolls = await Doll.find().sort({ createdAt: -1 });
    
    res.json({
      message: 'Dolls retrieved successfully',
      count: dolls.length,
      dolls: dolls
    });
    
  } catch (error) {
    console.error('Get all dolls error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve dolls', 
      error: error.message 
    });
  }
};

// ==================== GET SINGLE DOLL BY ID ====================
// GET /api/dolls/:id
exports.getDollById = async (req, res) => {
  try {
    const dollId = req.params.id;
    
    // Find doll by ID
    const doll = await Doll.findById(dollId);
    
    // Check if doll exists
    if (!doll) {
      return res.status(404).json({ 
        message: 'Doll not found' 
      });
    }
    
    res.json({
      message: 'Doll retrieved successfully',
      doll: doll
    });
    
  } catch (error) {
    console.error('Get doll error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve doll', 
      error: error.message 
    });
  }
};

// ==================== UPDATE DOLL ====================
// PUT /api/dolls/:id
exports.updateDoll = async (req, res) => {
  try {
    const dollId = req.params.id;
    const { name, color, size, imageUrl } = req.body;
    
    // Find doll
    const doll = await Doll.findById(dollId);
    
    if (!doll) {
      return res.status(404).json({ 
        message: 'Doll not found' 
      });
    }
    
    // Update fields if provided
    if (name) doll.name = name;
    if (color) doll.color = color;
    if (size) doll.size = size;
    if (imageUrl !== undefined) doll.imageUrl = imageUrl;
    
    // Save updated doll
    const updatedDoll = await doll.save();
    
    res.json({
      message: 'Doll updated successfully',
      doll: updatedDoll
    });
    
  } catch (error) {
    console.error('Update doll error:', error);
    res.status(400).json({ 
      message: 'Failed to update doll', 
      error: error.message 
    });
  }
};

// ==================== DELETE DOLL ====================
// DELETE /api/dolls/:id
exports.deleteDoll = async (req, res) => {
  try {
    const dollId = req.params.id;
    
    // Find and delete doll
    const doll = await Doll.findById(dollId);
    
    if (!doll) {
      return res.status(404).json({ 
        message: 'Doll not found' 
      });
    }
    
    await doll.deleteOne();
    
    res.json({
      message: 'Doll deleted successfully',
      deletedDoll: doll
    });
    
  } catch (error) {
    console.error('Delete doll error:', error);
    res.status(500).json({ 
      message: 'Failed to delete doll', 
      error: error.message 
    });
  }
};

// ==================== ADD PIN TO DOLL ====================
// POST /api/dolls/:id/pins
exports.addPin = async (req, res) => {
  try {
    const dollId = req.params.id;
    const { x, y, color } = req.body;
    
    // Validate coordinates
    if (x === undefined || y === undefined) {
      return res.status(400).json({ 
        message: 'Pin coordinates (x, y) are required' 
      });
    }
    
    // Find doll
    const doll = await Doll.findById(dollId);
    
    if (!doll) {
      return res.status(404).json({ 
        message: 'Doll not found' 
      });
    }
    
    // Add pin to doll's pins array
    doll.pins.push({
      x: Number(x),
      y: Number(y),
      color: color || '#ff0000',
      timestamp: new Date()
    });
    
    // Save updated doll
    const updatedDoll = await doll.save();
    
    res.json({
      message: 'Pin added successfully',
      doll: updatedDoll,
      newPin: doll.pins[doll.pins.length - 1]
    });
    
  } catch (error) {
    console.error('Add pin error:', error);
    res.status(400).json({ 
      message: 'Failed to add pin', 
      error: error.message 
    });
  }
};

// ==================== REMOVE PIN FROM DOLL ====================
// DELETE /api/dolls/:id/pins/:pinId
exports.removePin = async (req, res) => {
  try {
    const { id: dollId, pinId } = req.params;
    
    const doll = await Doll.findById(dollId);
    
    if (!doll) {
      return res.status(404).json({ 
        message: 'Doll not found' 
      });
    }
    
    // Remove pin by ID
    doll.pins = doll.pins.filter(pin => pin._id.toString() !== pinId);
    
    await doll.save();
    
    res.json({
      message: 'Pin removed successfully',
      doll: doll
    });
    
  } catch (error) {
    console.error('Remove pin error:', error);
    res.status(400).json({ 
      message: 'Failed to remove pin', 
      error: error.message 
    });
  }
};
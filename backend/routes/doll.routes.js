// routes/doll.routes.js
// This file defines all the URL endpoints for doll operations

const express = require('express');
const router = express.Router();
const dollController = require('../controllers/doll.controller');

// ==================== ROUTES ====================

// CREATE new doll
// URL: POST http://localhost:5000/api/dolls
// Body: { name, color, size, imageUrl }
router.post('/', dollController.createDoll);

// GET all dolls
// URL: GET http://localhost:5000/api/dolls
router.get('/', dollController.getAllDolls);

// GET single doll by ID
// URL: GET http://localhost:5000/api/dolls/:id
// Example: GET http://localhost:5000/api/dolls/67a1b2c3d4e5f6
router.get('/:id', dollController.getDollById);

// UPDATE doll
// URL: PUT http://localhost:5000/api/dolls/:id
// Body: { name, color, size }
router.put('/:id', dollController.updateDoll);

// DELETE doll
// URL: DELETE http://localhost:5000/api/dolls/:id
router.delete('/:id', dollController.deleteDoll);

// ADD pin to doll (for interactive clicking)
// URL: POST http://localhost:5000/api/dolls/:id/pins
// Body: { x, y, color }
router.post('/:id/pins', dollController.addPin);

// ==================== EXPORT ====================
module.exports = router;

// HOW THIS WORKS:
// 1. Frontend sends request: POST http://localhost:5000/api/dolls
// 2. server.js routes it to this file using: app.use('/api/dolls', dollRoutes)
// 3. This file matches the route (router.post('/')) 
// 4. Calls dollController.createDoll()
// 5. Controller does the work and sends response back
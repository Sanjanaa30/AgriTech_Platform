// routes/cropRoutes.js
const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const verifyToken = require('../middleware/verifyToken');

// 🔒 All routes below are protected

// @route   POST /api/crops
// @desc    Add new crop
router.post('/', verifyToken, cropController.addCrop);

// @route   GET /api/crops
// @desc    Get all crops for logged-in user
router.get('/', verifyToken, cropController.getCrops);

// @route   PUT /api/crops/:id
// @desc    Update a crop
router.put('/:id', verifyToken, cropController.updateCrop);

// @route   DELETE /api/crops/:id
// @desc    Delete a crop
router.delete('/:id', verifyToken, cropController.deleteCrop);

module.exports = router;

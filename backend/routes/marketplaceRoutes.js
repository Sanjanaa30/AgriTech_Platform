const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const marketplaceController = require('../controllers/marketplaceController');

// Get all marketplace crops
router.get('/crops', verifyToken, marketplaceController.getMarketplaceCrops);

// Get specific crop details
router.get('/crops/:cropId', verifyToken, marketplaceController.getCropDetails);

module.exports = router;

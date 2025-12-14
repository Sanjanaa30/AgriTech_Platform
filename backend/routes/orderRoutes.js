const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const orderController = require('../controllers/orderController');

// Create new order
router.post('/', verifyToken, orderController.createOrder);

// Get buyer's orders
router.get('/buyer', verifyToken, orderController.getBuyerOrders);

// Get farmer's orders (items being sold)
router.get('/farmer', verifyToken, orderController.getFarmerOrders);

// Get specific order details
router.get('/:orderId', verifyToken, orderController.getOrderDetails);

// Update order status
router.patch('/:orderId/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;

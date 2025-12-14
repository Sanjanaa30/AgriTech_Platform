const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const roleController = require('../controllers/roleController');

// Get user's roles
router.get('/', verifyToken, roleController.getUserRoles);

// Add new role to user
router.post('/add', verifyToken, roleController.addRoleToUser);

module.exports = router;

const User = require('../models/User');

// Add a new role to existing user
exports.addRoleToUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newRole } = req.body;

    if (!newRole) {
      return res.status(400).json({ message: 'New role is required' });
    }

    const validRoles = ['farmer', 'buyer', 'expert', 'government'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has this role
    if (user.roles.includes(newRole)) {
      return res.status(400).json({ message: 'You already have this role' });
    }

    // Add the new role
    user.roles.push(newRole);
    await user.save();

    res.json({ 
      message: 'Role added successfully', 
      roles: user.roles 
    });
  } catch (err) {
    console.error('❌ Error adding role:', err.message);
    res.status(500).json({ message: 'Failed to add role' });
  }
};

// Get user's roles
exports.getUserRoles = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId, 'roles firstName lastName');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      roles: user.roles,
      name: `${user.firstName} ${user.lastName}`
    });
  } catch (err) {
    console.error('❌ Error fetching roles:', err.message);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

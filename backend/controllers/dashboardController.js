// controllers/dashboardController.js
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Placeholder data — replace with real DB queries later
    const dashboardData = {
      cropsCount: 12,
      cropTypesCount: 4,
      username: 'Farmer User',
      userId
    };

    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

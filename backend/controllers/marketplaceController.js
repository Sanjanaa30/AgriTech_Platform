const Crop = require('../models/Crop');
const User = require('../models/User');

// Get all listed crops for marketplace (buyers)
exports.getMarketplaceCrops = async (req, res) => {
  try {
    const { category, season, minPrice, maxPrice, search } = req.query;

    let query = { isListed: true };

    // Apply filters
    if (category) query.category = category;
    if (season) query.season = season;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } }
      ];
    }

    const crops = await Crop.find(query).lean();

    // Fetch farmer details for each crop
    const cropsWithFarmerInfo = await Promise.all(
      crops.map(async (crop) => {
        const farmer = await User.findOne({ _id: crop.userId }, 'firstName lastName state district mobile').lean();
        return {
          ...crop,
          farmerName: farmer ? `${farmer.firstName} ${farmer.lastName}` : 'Unknown',
          farmerLocation: farmer ? `${farmer.district}, ${farmer.state}` : 'Unknown',
          farmerContact: farmer?.mobile || 'N/A'
        };
      })
    );

    res.json(cropsWithFarmerInfo);
  } catch (err) {
    console.error('❌ Error fetching marketplace crops:', err.message);
    res.status(500).json({ message: 'Failed to fetch marketplace crops' });
  }
};

// Get crop details for a specific crop
exports.getCropDetails = async (req, res) => {
  try {
    const { cropId } = req.params;
    
    const crop = await Crop.findById(cropId).lean();
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const farmer = await User.findOne({ _id: crop.userId }, 'firstName lastName state district mobile email').lean();

    res.json({
      ...crop,
      farmerName: farmer ? `${farmer.firstName} ${farmer.lastName}` : 'Unknown',
      farmerLocation: farmer ? `${farmer.district}, ${farmer.state}` : 'Unknown',
      farmerContact: farmer?.mobile || 'N/A',
      farmerEmail: farmer?.email || 'N/A'
    });
  } catch (err) {
    console.error('❌ Error fetching crop details:', err.message);
    res.status(500).json({ message: 'Failed to fetch crop details' });
  }
};

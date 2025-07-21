// controllers/cropController.js
const Crop = require('../models/Crop');

// @desc Add a new crop
exports.addCrop = async (req, res) => {
  try {
    const userId = req.user.userId;

    const newCrop = new Crop({
      ...req.body,
      userId,
    });

    const savedCrop = await newCrop.save();
    res.status(201).json(savedCrop);
  } catch (err) {
    console.error('Error adding crop:', err.message);
    res.status(500).json({ message: 'Failed to add crop' });
  }
};

// @desc Get all crops for a user
exports.getCrops = async (req, res) => {
  try {
    const userId = req.user.userId;

    const crops = await Crop.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(crops);
  } catch (err) {
    console.error('Error fetching crops:', err.message);
    res.status(500).json({ message: 'Failed to fetch crops' });
  }
};

// @desc Update a crop by ID
exports.updateCrop = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cropId = req.params.id;

    const crop = await Crop.findOne({ _id: cropId, userId });

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    Object.assign(crop, req.body);
    const updatedCrop = await crop.save();

    res.status(200).json(updatedCrop);
  } catch (err) {
    console.error('Error updating crop:', err.message);
    res.status(500).json({ message: 'Failed to update crop' });
  }
};

// @desc Delete a crop by ID
exports.deleteCrop = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cropId = req.params.id;

    const crop = await Crop.findOneAndDelete({ _id: cropId, userId });

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found or unauthorized' });
    }

    res.status(200).json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('Error deleting crop:', err.message);
    res.status(500).json({ message: 'Failed to delete crop' });
  }
};

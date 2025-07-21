// models/Crop.js
const mongoose = require('mongoose');

// Only enforce userId, name, sowing/harvestDate, and status if needed
const cropSchema = new mongoose.Schema({
    userId: {
        type: String,  // 👈 instead of ObjectId
        required: true
    },
    name: { type: String }, // ✅ remove "required: true"
    category: { type: String },
    variety: { type: String, default: 'N/A' },
    season: { type: String, default: '' },
    sowingDate: { type: Date }, // can be optional
    harvestDate: { type: Date },
    status: { type: String },
    imageUrl: { type: String, default: '' },
    area: { type: Number, default: 0 },
    irrigationType: { type: String, default: 'N/A' },
    lastActivity: { type: String, default: 'No recent activity' },
    notesHistory: { type: [String], default: [] },
    aiHealthScore: { type: Number, default: 82 },
    isListed: { type: Boolean, default: true },
    timeSinceSowed: { type: Number, default: 0 }
}, { timestamps: true });


module.exports = mongoose.model('Crop', cropSchema);

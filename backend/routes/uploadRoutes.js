// ✅ Requires
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// ✅ Ensures upload folder exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'crops');
fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Multer config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ✅ Upload endpoint
router.post('/crop-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `http://localhost:5000/uploads/crops/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

module.exports = router;

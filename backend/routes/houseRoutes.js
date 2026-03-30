const express = require('express');
const router = express.Router();
const {
  getAllHouses, getHouseById, createHouse, updateHouse, deleteHouse,
} = require('../controllers/houseController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'houses');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `house_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Only image files are allowed (jpg, png, webp).'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

// GET /api/houses - List/search houses (Public)
router.get('/', getAllHouses);

// GET /api/houses/:id - Get single house (Public)
router.get('/:id', getHouseById);

// POST /api/houses - Create listing (Landlord only)
router.post('/', auth, authorize('landlord'), upload.array('images', 10), createHouse);

// PUT /api/houses/:id - Update listing (Landlord owner)
router.put('/:id', auth, authorize('landlord', 'admin'), updateHouse);

// DELETE /api/houses/:id - Delete listing (Landlord owner or Admin)
router.delete('/:id', auth, authorize('landlord', 'admin'), deleteHouse);

module.exports = router;

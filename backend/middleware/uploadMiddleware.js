const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

module.exports = upload;

/*
 * NOTE: This stores images on local disk under /backend/uploads, served statically
 * (see server.js: app.use('/uploads', express.static(...))).
 * This works fine for a single Render instance, but Render's filesystem is ephemeral
 * on redeploy/restart — uploaded images will be lost. For production, swap this
 * storage engine for a cloud provider (Cloudinary, AWS S3, etc.) without changing
 * any controller code, since controllers just read `req.file.filename` / `req.files`.
 */

const multer = require('multer');
const path = require('path');

// Storage logic
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/properties/others';

    if (file.fieldname === 'featured_image') {
      folder = 'uploads/properties/featured';
    } else if (file.fieldname === 'gallery_images') {
      folder = 'uploads/properties/gallery';
    } else if (file.fieldname === 'videos') {
      folder = 'uploads/properties/videos';
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

// File filters
const fileFilter = (req, file, cb) => {
  if (
    (file.fieldname === 'featured_image' || file.fieldname === 'gallery_images') &&
    file.mimetype.startsWith('image')
  ) {
    cb(null, true);
  } else if (file.fieldname === 'videos' && file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }
};

// Multer upload
exports.uploadPropertyMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Max 50MB
  }
}).fields([
  { name: 'featured_image', maxCount: 1 },
  { name: 'gallery_images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]);

// File URL helper
exports.getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  return `${req.protocol}://${req.get('host')}/${filePath.replace(/\\/g, '/')}`;
};

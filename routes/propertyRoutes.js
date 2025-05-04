const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadPropertyMedia } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getProperty);

// Protected routes
router.use(authMiddleware);

router.post('/',uploadPropertyMedia, propertyController.createProperty);

router.patch('/:id', uploadPropertyMedia, propertyController.updateProperty);


router.delete('/:id', propertyController.deleteProperty);

// Like routes
router.get('/likedProperties', propertyController.getLikedProperties);
router.post('/:id/like', propertyController.likeProperty);
router.delete('/:id/unlike', propertyController.unlikeProperty);

module.exports = router;
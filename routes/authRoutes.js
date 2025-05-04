const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/register-admin', authController.registerAdmin);
router.post('/login', authController.login);
router.get('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getUser);
router.patch('/update-profile', authMiddleware, authController.updateProfile);

// Admin only routes
router.get('/users', authMiddleware, authController.getAllUsers);
router.delete('/users/:id', authMiddleware, authController.deleteUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authenticate, authController.logout);

module.exports = router;

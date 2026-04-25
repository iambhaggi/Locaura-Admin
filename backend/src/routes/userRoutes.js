const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/', authenticate, authorize(['SuperAdmin', 'Admin']), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.patch('/:id/status', authenticate, authorize(['SuperAdmin', 'Admin']), userController.updateUserStatus);
router.delete('/:id', authenticate, authorize(['SuperAdmin']), userController.deleteUser);

module.exports = router;

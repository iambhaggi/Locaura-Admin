const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const supportController = require('../controllers/supportController');

router.get('/tickets', authenticate, supportController.getAllTickets);
router.get('/tickets/:id', authenticate, supportController.getTicketById);
router.put('/tickets/:id/status', authenticate, authorize(['SuperAdmin', 'Admin', 'Support']), supportController.updateTicketStatus);
router.post('/tickets/:id/assign', authenticate, authorize(['SuperAdmin', 'Admin']), supportController.assignTicket);

module.exports = router;

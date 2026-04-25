const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');

// Get all consumers (read from app DB)
router.get('/', consumerController.getAllConsumers);

// Sync consumer data from app to admin DB
router.post('/sync', consumerController.syncConsumerData);

// Get single consumer
router.get('/:id', consumerController.getConsumerById);

module.exports = router;
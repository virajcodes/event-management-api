const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.post('/', eventController.createEvent);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:id/stats', eventController.getEventStats);
router.get('/:id', eventController.getEvent);
router.post('/:id/register', eventController.registerUser);
router.delete('/:id/register/:userId', eventController.cancelRegistration);

module.exports = router;

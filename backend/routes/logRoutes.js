const express = require('express');
const router = express.Router();
const { createLog, getLogsByDate, updateLog } = require('../controllers/logController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', createLog);
router.get('/date/:date', getLogsByDate);
router.put('/:id', updateLog);

module.exports = router;

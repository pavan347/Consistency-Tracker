const express = require('express');
const router = express.Router();
const { getWeeklyStats, getOverallStats, getHeatmapData } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/weekly', getWeeklyStats);
router.get('/overall', getOverallStats);
router.get('/heatmap', getHeatmapData);

module.exports = router;

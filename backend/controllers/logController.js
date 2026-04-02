const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');

// Helper: get today's date as YYYY-MM-DD in UTC
const getTodayUTC = () => {
    return new Date().toISOString().split('T')[0];
};

// POST /api/logs
const createLog = async (req, res) => {
    try {
        const { habitId, status, note } = req.body;
        const today = getTodayUTC();

        // Verify the habit belongs to the user
        const habit = await Habit.findOne({
            _id: habitId,
            userId: req.user._id,
            isDeleted: false,
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Check if log already exists for today
        const existingLog = await HabitLog.findOne({ habitId, date: today });
        if (existingLog) {
            // Update existing log instead
            existingLog.status = status;
            if (note !== undefined) existingLog.note = note;
            await existingLog.save();
            return res.json(existingLog);
        }

        const log = await HabitLog.create({
            habitId,
            date: today,
            status,
            note: note || '',
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/logs/date/:date
const getLogsByDate = async (req, res) => {
    try {
        const { date } = req.params;

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Get all active habits for this user
        const habits = await Habit.find({
            userId: req.user._id,
            isDeleted: false,
        });

        const habitIds = habits.map((h) => h._id);

        // Get logs for these habits on this date
        const logs = await HabitLog.find({
            habitId: { $in: habitIds },
            date,
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/logs/:id
const updateLog = async (req, res) => {
    try {
        const { status, note } = req.body;
        const today = getTodayUTC();

        const log = await HabitLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Log not found' });
        }

        // CRITICAL: Only allow editing current day logs
        if (log.date !== today) {
            return res.status(403).json({ message: 'Cannot edit past logs. Logs are immutable after the day passes.' });
        }

        // Verify the habit belongs to the user
        const habit = await Habit.findOne({
            _id: log.habitId,
            userId: req.user._id,
        });

        if (!habit) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (status) log.status = status;
        if (note !== undefined) log.note = note;
        await log.save();

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createLog, getLogsByDate, updateLog };

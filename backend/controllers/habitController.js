const Habit = require('../models/Habit');

// Helper: get today's date as YYYY-MM-DD in UTC
const getTodayUTC = () => {
    return new Date().toISOString().split('T')[0];
};

// POST /api/habits
const createHabit = async (req, res) => {
    try {
        const { name, scheduledDays } = req.body;

        if (!name || !scheduledDays || scheduledDays.length === 0) {
            return res.status(400).json({ message: 'Name and scheduled days are required' });
        }

        const habit = await Habit.create({
            userId: req.user._id,
            name,
            scheduledDays,
        });

        res.status(201).json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/habits
const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({
            userId: req.user._id,
            isDeleted: false,
        }).sort({ createdAt: -1 }).lean();

        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/habits/:id
const updateHabit = async (req, res) => {
    try {
        const { name, scheduledDays } = req.body;
        const habit = await Habit.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false,
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Changes apply from today forward only
        if (name) habit.name = name;
        if (scheduledDays && scheduledDays.length > 0) {
            habit.scheduledDays = scheduledDays;
        }

        await habit.save();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/habits/:id  (soft delete)
const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false,
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        habit.isDeleted = true;
        await habit.save();

        res.json({ message: 'Habit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createHabit, getHabits, updateHabit, deleteHabit };

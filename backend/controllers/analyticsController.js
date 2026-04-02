const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');

// Helper: get today's date as YYYY-MM-DD in UTC
const getTodayUTC = () => {
    return new Date().toISOString().split('T')[0];
};

// Helper: get day abbreviation from date
const getDayAbbr = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr + 'T00:00:00Z').getUTCDay()];
};

// GET /api/analytics/weekly
const getWeeklyStats = async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id, isDeleted: false });
        const habitIds = habits.map((h) => h._id);

        // Get last 7 days
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setUTCDate(d.getUTCDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        const logs = await HabitLog.find({
            habitId: { $in: habitIds },
            date: { $in: dates },
        });

        // Calculate scheduled vs completed for each day
        let totalScheduled = 0;
        let totalCompleted = 0;

        const dailyStats = dates.map((date) => {
            const dayAbbr = getDayAbbr(date);
            const scheduledHabits = habits.filter((h) => h.scheduledDays.includes(dayAbbr));
            const dayLogs = logs.filter((l) => l.date === date);
            const completed = dayLogs.filter((l) => l.status === 'done').length;

            totalScheduled += scheduledHabits.length;
            totalCompleted += completed;

            return {
                date,
                day: dayAbbr,
                scheduled: scheduledHabits.length,
                completed,
                percentage: scheduledHabits.length > 0 ? Math.round((completed / scheduledHabits.length) * 100) : 0,
            };
        });

        res.json({
            weeklyConsistency: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
            dailyStats,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/analytics/overall
const getOverallStats = async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id, isDeleted: false });
        const habitIds = habits.map((h) => h._id);

        const allLogs = await HabitLog.find({ habitId: { $in: habitIds } });

        // Per-habit stats
        const habitStats = habits.map((habit) => {
            const habitLogs = allLogs.filter((l) => l.habitId.toString() === habit._id.toString());
            const done = habitLogs.filter((l) => l.status === 'done').length;
            const total = habitLogs.length;

            // Calculate current streak
            let streak = 0;
            const today = getTodayUTC();
            let checkDate = new Date(today + 'T00:00:00Z');

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                const dayAbbr = getDayAbbr(dateStr);

                // Skip non-scheduled days
                if (!habit.scheduledDays.includes(dayAbbr)) {
                    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
                    continue;
                }

                const log = habitLogs.find((l) => l.date === dateStr);

                if (log && log.status === 'done') {
                    streak++;
                    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
                } else {
                    // If today and no log yet, skip today in streak check
                    if (dateStr === today && !log) {
                        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
                        continue;
                    }
                    break;
                }
            }

            return {
                habitId: habit._id,
                name: habit.name,
                scheduledDays: habit.scheduledDays,
                totalDone: done,
                totalLogs: total,
                consistency: total > 0 ? Math.round((done / total) * 100) : 0,
                currentStreak: streak,
            };
        });

        // Sort to find best and worst
        const sorted = [...habitStats].sort((a, b) => b.consistency - a.consistency);
        const bestHabit = sorted.length > 0 ? sorted[0] : null;

        // Only set worst habit if it actually has lower consistency than the best one
        const worstHabit = sorted.length > 1 && sorted[sorted.length - 1].consistency < sorted[0].consistency
            ? sorted[sorted.length - 1]
            : null;

        // Day of week patterns
        const dayPatterns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
            const dayLogs = allLogs.filter((l) => getDayAbbr(l.date) === day);
            const done = dayLogs.filter((l) => l.status === 'done').length;
            return {
                day,
                total: dayLogs.length,
                done,
                percentage: dayLogs.length > 0 ? Math.round((done / dayLogs.length) * 100) : 0,
            };
        });

        // Overall consistency
        const totalDone = allLogs.filter((l) => l.status === 'done').length;
        const overallConsistency = allLogs.length > 0 ? Math.round((totalDone / allLogs.length) * 100) : 0;

        res.json({
            overallConsistency,
            totalHabits: habits.length,
            habitStats,
            bestHabit,
            worstHabit,
            dayPatterns,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/analytics/heatmap
const getHeatmapData = async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id, isDeleted: false });
        const habitIds = habits.map((h) => h._id);

        // Get last 365 days
        const today = new Date();
        const startDate = new Date(today);
        startDate.setUTCDate(startDate.getUTCDate() - 364);

        const allLogs = await HabitLog.find({
            habitId: { $in: habitIds },
            date: {
                $gte: startDate.toISOString().split('T')[0],
                $lte: today.toISOString().split('T')[0],
            },
        });

        // Build heatmap: each day => { date, completionPercentage }
        const heatmapData = [];
        for (let i = 0; i <= 364; i++) {
            const d = new Date(startDate);
            d.setUTCDate(d.getUTCDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayAbbr = getDayAbbr(dateStr);

            const scheduledHabits = habits.filter((h) => h.scheduledDays.includes(dayAbbr));
            const dayLogs = allLogs.filter((l) => l.date === dateStr);
            const completed = dayLogs.filter((l) => l.status === 'done').length;

            heatmapData.push({
                date: dateStr,
                scheduled: scheduledHabits.length,
                completed,
                percentage: scheduledHabits.length > 0 ? Math.round((completed / scheduledHabits.length) * 100) : -1,
            });
        }

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getWeeklyStats, getOverallStats, getHeatmapData };

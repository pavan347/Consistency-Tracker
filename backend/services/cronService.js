const cron = require('node-cron');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// Helper: get day abbreviation from date
const getDayAbbr = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr + 'T00:00:00Z').getUTCDay()];
};

const initCronJobs = () => {
    // Run at midnight UTC every day
    // Marks missed habits for the previous day
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('[CRON] Running auto-miss job...');

            const yesterday = new Date();
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const dayAbbr = getDayAbbr(yesterdayStr);

            // Find all active habits scheduled for yesterday
            const habits = await Habit.find({
                isDeleted: false,
                scheduledDays: dayAbbr,
            });

            let createdCount = 0;

            for (const habit of habits) {
                // Check if a log already exists
                const existingLog = await HabitLog.findOne({
                    habitId: habit._id,
                    date: yesterdayStr,
                });

                if (!existingLog) {
                    await HabitLog.create({
                        habitId: habit._id,
                        date: yesterdayStr,
                        status: 'missed',
                        note: '',
                    });
                    createdCount++;
                }
            }

            console.log(`[CRON] Auto-missed ${createdCount} habit logs for ${yesterdayStr}`);
        } catch (error) {
            console.error('[CRON] Error in auto-miss job:', error.message);
        }
    }, {
        timezone: 'UTC',
    });

    console.log('[CRON] Auto-miss cron job initialized (runs daily at midnight UTC)');
};

module.exports = initCronJobs;

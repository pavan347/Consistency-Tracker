const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
    {
        habitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Habit',
            required: true,
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
        },
        status: {
            type: String,
            enum: ['done', 'missed'],
            required: [true, 'Status is required'],
        },
        note: {
            type: String,
            maxlength: [500, 'Note cannot exceed 500 characters'],
            default: '',
        },
    },
    { timestamps: true }
);

// Compound unique index: one log per habit per day
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);

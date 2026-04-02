const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Habit name is required'],
            trim: true,
            maxlength: [100, 'Habit name cannot exceed 100 characters'],
        },
        scheduledDays: {
            type: [String],
            required: [true, 'Scheduled days are required'],
            validate: {
                validator: function (days) {
                    const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    return days.length > 0 && days.every((d) => validDays.includes(d));
                },
                message: 'Scheduled days must contain valid day abbreviations (Mon-Sun)',
            },
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);

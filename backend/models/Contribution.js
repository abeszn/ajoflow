const mongoose = require('mongoose');

const contributionSchema = mongoose.Schema(
    {
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        contributionPeriod: {
            type: String,
            required: true,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        paidDate: {
            type: Date,
            default: Date.now,
        },

        status: {
            type: String,
            enum: ['paid', 'missed', 'pending'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Contribution', contributionSchema);

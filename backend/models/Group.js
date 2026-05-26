const mongoose = require("mongoose");

const groupSchema = mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true
        },

        contributionAmount: {
            type: Number,
            required: true,
        },

        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly"],
            default: "monthly",
        },

        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Group", groupSchema);

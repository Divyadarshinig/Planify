const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        // ⚡ Energy required for the task
        energyLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        dueDate: {
            type: Date
        },

        reminder: {
            type: Date,
            default: null
        },

        // 🌙 Focus of the Day
        isFocus: {
            type: Boolean,
            default: false
        },

        // 📅 Date when the task was completed
        completedAt: {
            type: Date,
            default: null
        },

        // 👤 Task owner
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);
const mongoose = require('mongoose')

const SavingGoalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    savingAmount: Number,
    categoricalThresholds: [
        {
            category: { type: String, required: true },
            amount: { type: Number, required: true }
        }
    ]
}, {
    timestamps: {
        currentTime: () => {
            const now = new Date();
            const offset = now.getTimezoneOffset();
            return new Date(now.getTime() - offset * 60000);
        }
    }
})

const SavingGoal = mongoose.model('SavingGoal', SavingGoalSchema)

module.exports = SavingGoal
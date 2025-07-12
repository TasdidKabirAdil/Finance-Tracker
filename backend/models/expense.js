const mongoose = require('mongoose')

const expenseSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ['MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION', 'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING', 'GIFT', 'HEALTHCARE', 'INSURANCE'],
        required: true
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, {
    timestamps: {
        currentTime: () => {
            const now = new Date();
            const offset = now.getTimezoneOffset();
            return new Date(now.getTime() - offset * 60000);
        }
    }
})

const Expense = mongoose.model("Expense", expenseSchema)

module.exports = Expense
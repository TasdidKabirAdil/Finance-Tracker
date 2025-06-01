const mongoose = require('mongoose')

const expenseSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION', 'ULITITY', 'GAMES'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true })

const Expense = mongoose.model("Expense", expenseSchema)

module.exports = Expense
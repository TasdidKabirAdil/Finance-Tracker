const mongoose = require('mongoose')

const monthlyReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetMonth: { type: String, required: true },
    totalExpense: Number,
    savedAmount: Number,
    topCategory: String,
    spendingByCategory: Array,
    spendingVsAverage: Number,
    acknowledged: { type: Boolean, default: false }
}, {timestamps: true} )

const MonthlyReport = mongoose.model('MonthlyReport', monthlyReportSchema)

module.exports = MonthlyReport
const cron = require('node-cron');
const MonthlyReport = require('../models/monthlyReport');
const Expense = require('../models/expense');
const User = require('../models/user');

// Generate a monthly report for a user and target month
async function generateReport(userId, targetMonth) {
    try {
        const expenses = await Expense.find({ userId });
        const user = await User.findById(userId);
        const reports = await MonthlyReport.find({ userId });

        // Calculate total expenses for the month
        const totalExpense = expenses
            .filter((exp) => {
                const month = new Date(exp.date).toISOString().slice(0, 7);
                return month === targetMonth;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);

        // Calculate saved amount = income - total spent (min 0)
        const savedAmount = Math.max(user.estimatedMonthlyIncome - totalExpense, 0);

        const categories = [
            'MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION',
            'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING',
            'GIFT', 'HEALTHCARE', 'INSURANCE'
        ];

        // Calculate total spent per category for the month
        const spendingByCategory = categories
            .map(category => {
                const amount = expenses
                    .filter(exp => {
                        const month = new Date(exp.date).toISOString().slice(0, 7);
                        return exp.category === category && month === targetMonth;
                    })
                    .reduce((sum, exp) => sum + exp.amount, 0);
                return { category, amount };
            })
            .filter(item => item.amount > 0);

        // Calculate variance from average of previous 3 months
        let len = reports.length;
        let spendingVsAverage = 0;

        if (reports.length > 3) len = 3;

        if (len > 0) {
            function getPreviousMonths(targetMonth, count) {
                let [origYear, origMonth] = targetMonth.split("-").map(Number);
                let results = [];
                for (let i = 1; i <= count; i++) {
                    origMonth -= 1;
                    if (origMonth == 0) {
                        origMonth = 12;
                        origYear -= 1;
                    }
                    const mm = origMonth < 10 ? `0${origMonth}` : origMonth;
                    results.push(`${origYear}-${mm}`);
                }
                return results;
            }

            const prevMonths = getPreviousMonths(targetMonth, len);
            let prevSpendings = 0;

            prevMonths.forEach((month) => {
                const report = reports.find(r => r.targetMonth === month);
                if (report) prevSpendings += report.totalExpense;
            });

            spendingVsAverage = (prevSpendings / len) - totalExpense;
        }

        // Determine top spending category
        let topCategory = '';
        let max = 0;
        spendingByCategory.forEach(({ category, amount }) => {
            if (amount > max) {
                max = amount;
                topCategory = category;
            }
        });

        const acknowledged = false;

        // Create and save new report
        const newMonthlyReport = new MonthlyReport({
            userId,
            targetMonth,
            totalExpense,
            savedAmount,
            topCategory,
            spendingByCategory,
            spendingVsAverage,
            acknowledged
        });

        await newMonthlyReport.save();

        return {
            id: newMonthlyReport._id.toString(),
            ...newMonthlyReport.toObject()
        };
    } catch (err) {
        console.error("Error creating monthly report", err);
        throw new Error(err.message);
    }
}

// Get the previous month as YYYY-MM string
function getPreviousMonth() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-based (0 = January)

    if (month === 0) {
        year -= 1;
        month = 12;
    }

    const mm = month < 10 ? `0${month}` : `${month}`;
    return `${year}-${mm}`;
}

// Cron job: runs at 12:00 AM on the 1st day of every month
cron.schedule('0 0 1 * *', async () => {
    console.log('📊 Generating monthly reports...');
    const users = await User.find();
    const prevMonth = getPreviousMonth();

    for (const user of users) {
        // Avoid duplicate reports
        const reportExists = await MonthlyReport.findOne({ userId: user._id, prevMonth });
        if (!reportExists) {
            await generateReport(user._id, prevMonth);
        }
    }
});

module.exports = generateReport;

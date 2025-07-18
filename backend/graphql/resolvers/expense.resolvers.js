const Expense = require('../../models/expense')
const MonthlyReport = require('../../models/monthlyReport')
const User = require('../../models/user')

const formatExpense = (expense) => ({
    id: expense._id.toString(),
    ...expense.toObject()
})

const DateOffset = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - (offset * 60 * 1000));
}

const expenseResolvers = {
    Query: {
        expenses: async (_, { userId }) => {
            try {
                const expenses = await Expense.find({ userId })
                return expenses.map((expense) => (formatExpense(expense)))
            } catch (err) {
                console.error("Expenses not found", err)
                throw new Error(err.message)
            }
        },

        expense: async (_, { id }) => {
            try {
                const expense = await Expense.findById(id)
                return formatExpense(expense)
            } catch (err) {
                console.error("Expense not found", err)
                throw new Error(err.message)
            }
        },

        dailyExpense: async (_, { userId }) => {
            try {
                // Fetch all expenses for the user
                const expenses = await Expense.find({ userId });

                // Get today's and yesterday's date (normalized to local offset)
                const today = DateOffset(); // Assumes helper returns local Date object
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                // Format dates as YYYY-MM-DD for comparison
                const formattedToday = today.toISOString().slice(0, 10);
                const formattedYesterday = yesterday.toISOString().slice(0, 10);

                // Initialize totals and counters
                let totalToday = 0;
                let totalYesterday = 0;
                let expenseCount = 0;
                const categorySums = {};

                // Loop through all expenses and group by date/category
                expenses.forEach(exp => {
                    const expDate = new Date(exp.date).toISOString().slice(0, 10);

                    if (expDate === formattedToday) {
                        totalToday += exp.amount;
                        expenseCount++;

                        if (!categorySums[exp.category]) {
                            categorySums[exp.category] = 0;
                        }

                        categorySums[exp.category] += exp.amount;
                    }

                    if (expDate === formattedYesterday) {
                        totalYesterday += exp.amount;
                    }
                });

                // Calculate the change from yesterday (positive = saved more today)
                const prevDayComparison = totalYesterday - totalToday;

                // Determine which category had the highest spending today
                let topCategory = '';
                let maxSpent = 0;

                for (const [category, amount] of Object.entries(categorySums)) {
                    if (amount > maxSpent) {
                        maxSpent = amount;
                        topCategory = category;
                    }
                }

                // Return summarized daily data
                return {
                    totalDailyExpense: totalToday,
                    prevDayComparison,
                    numberOfExpense: expenseCount,
                    topCategory
                };
            } catch (err) {
                console.error("Failed calculating daily expense", err);
                throw new Error(err.message);
            }
        },


        totalMonthlyExpense: async (_, { userId, targetMonth }) => {
            try {
                const expenses = await Expense.find({ userId })

                const total = expenses
                    .filter((exp) => {
                        const month = new Date(exp.date).toISOString().slice(0, 7)
                        return month === targetMonth
                    })
                    .reduce((sum, exp) => sum + exp.amount, 0)
                return total
            } catch (err) {
                console.error("Failed calculating total monthy expense", err)
                throw new Error(err.message)
            }
        },

        categoryExpense: async (_, { userId, targetMonth }) => {
            try {
                const expenses = await Expense.find({ userId })
                const categories = ['MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION', 'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING', 'GIFT', 'HEALTHCARE', 'INSURANCE']
                const categoryExpense = categories
                    .map(category => {
                        const amount = expenses
                            .filter(exp => {
                                const month = new Date(exp.date).toISOString().slice(0, 7)
                                return exp.category === category && month === targetMonth
                            })
                            .reduce((sum, exp) => sum + exp.amount, 0);
                        return { category, amount };
                    })
                    .filter(item => item.amount > 0);
                return categoryExpense

            } catch (err) {
                console.error("Failed calculating categorical expense", err)
                throw new Error(err.message)
            }
        },

        monthlyTotal: async (_, { userId }) => {
            try {
                const expenses = await Expense.find({ userId });
                if (!expenses) return [];

                // Get current month in YYYY-MM format
                const currentMonth = new Date().toISOString().slice(0, 7);
                let [origYear, origMonth] = currentMonth.split("-").map(Number);

                // Map month numbers to short labels
                const monthDict = {
                    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
                    7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
                };

                const prevMonths = [];
                const result = [];

                // Track last 5 months from current
                const totalMonths = 5;
                let month = origMonth;
                let year = origYear;

                for (let i = 0; i < totalMonths; i++) {
                    const mm = month < 10 ? `0${month}` : month;

                    prevMonths.push({
                        key: `${year}-${mm}`, // YYYY-MM format for matching
                        label: `${monthDict[month]}-${year}` // e.g. "Jul-2025"
                    });

                    month--;
                    if (month === 0) {
                        month = 12;
                        year--;
                    }
                }

                prevMonths.reverse(); // Ensure oldest to newest

                // Aggregate monthly totals
                prevMonths.forEach((monthObj) => {
                    const total = expenses
                        .filter((exp) => {
                            const expMonth = new Date(exp.date).toISOString().slice(0, 7);
                            return expMonth === monthObj.key;
                        })
                        .reduce((sum, exp) => sum + exp.amount, 0);

                    result.push({
                        month: monthObj.label,
                        amount: total
                    });
                });

                return result;

            } catch (err) {
                console.error("Failed calculating monthly total", err);
                throw new Error(err.message);
            }
        },


        typicalSpent: async (_, { userId }) => {
            try {
                const expenses = await Expense.find({ userId });
                if (!expenses || expenses.length === 0) return 0;

                // Start from current date (with local timezone offset)
                const currDate = DateOffset();
                let [year, month] = [currDate.getFullYear(), currDate.getMonth() + 1];

                const targetMonths = [];

                // Build array of previous 3 months
                for (let i = 1; i <= 3; i++) {
                    month--;
                    if (month === 0) {
                        month = 12;
                        year--;
                    }
                    const formattedMonth = month < 10 ? `0${month}` : `${month}`;
                    targetMonths.push(`${year}-${formattedMonth}`);
                }

                const monthlySums = {};

                // Aggregate spending by month
                expenses.forEach(expense => {
                    const expenseMonth = expense.date.toISOString().slice(0, 7);
                    if (targetMonths.includes(expenseMonth)) {
                        monthlySums[expenseMonth] = (monthlySums[expenseMonth] || 0) + expense.amount;
                    }
                });

                const validMonths = Object.keys(monthlySums);
                if (validMonths.length === 0) return 0;

                const total = validMonths.reduce((sum, month) => sum + monthlySums[month], 0);
                const average = total / validMonths.length;

                return average;
            } catch (err) {
                console.error("Failed calculating typical spending", err);
                throw new Error(err.message);
            }
        },


        monthlyReports: async (_, { userId }) => {
            try {
                const reports = await MonthlyReport.find({ userId })

                return (reports ?? []).map((report) => ({
                    id: report._id.toString(),
                    ...report.toObject()
                }));
            } catch (err) {
                console.error("Failed fetching monthly reports", err)
                throw new Error(err.message)
            }
        },

        monthlyReport: async (_, { userId, targetMonth }) => {
            try {
                const report = await MonthlyReport.findOne({ userId, targetMonth })
                return {
                    id: report._id.toString(),
                    ...report.toObject()
                };
            } catch (err) {
                console.error("Failed fetching monthly report", err)
                throw new Error(err.message)
            }
        },

    },

    Mutation: {
        addExpense: async (_, { userId, name, category, amount, date }) => {
            try {
                const newExpense = new Expense({
                    userId, name, category, amount, date
                })
                await newExpense.save()
                return formatExpense(newExpense)
            } catch (err) {
                console.error("Error adding expense", err)
                throw new Error(err.message)
            }
        },

        updateExpense: async (_, { id, name, category, amount, date }) => {
            try {
                const updateExpense = await Expense.findByIdAndUpdate(id, { name, category, amount, date }, { new: true })
                return formatExpense(updateExpense)
            } catch (err) {
                console.error("Error updating expense", err)
                throw new Error(err.message)
            }
        },

        deleteExpense: async (_, { id }) => {
            try {
                const deleteExpense = await Expense.findByIdAndDelete(id)
                return formatExpense(deleteExpense)
            } catch (err) {
                console.error("Error deleting expense", err)
                throw new Error(err.message)
            }
        },

        addMonthlyReport: async (_, { userId, targetMonth }) => {
            try {
                const expenses = await Expense.find({ userId })
                const user = await User.findById(userId)
                const reports = await MonthlyReport.find({ userId })

                const totalExpense = expenses
                    .filter((exp) => {
                        const month = new Date(exp.date).toISOString().slice(0, 7)
                        return month === targetMonth
                    })
                    .reduce((sum, exp) => sum + exp.amount, 0)

                const savedAmount = Math.max(user.estimatedMonthlyIncome - totalExpense, 0);
                const categories =
                    ['MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION',
                        'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING', 'GIFT', 'HEALTHCARE', 'INSURANCE']
                const spendingByCategory = categories
                    .map(category => {
                        const amount = expenses
                            .filter(exp => {
                                const month = new Date(exp.date).toISOString().slice(0, 7)
                                return exp.category === category && month === targetMonth
                            })
                            .reduce((sum, exp) => sum + exp.amount, 0);
                        return { category, amount };
                    })
                    .filter(item => item.amount > 0);

                let len = reports.length
                let spendingVsAverage = 0
                if (reports.length > 3) { len = 3 }
                if (len > 0) {
                    function getPreviousMonths(targetMonth, count) {
                        let [origYear, origMonth] = targetMonth.split("-").map(Number);
                        let results = []
                        for (let i = 1; i <= count; i++) {
                            origMonth -= 1
                            if (origMonth == 0) {
                                origMonth = 12
                                origYear -= 1
                            }
                            const mm = origMonth < 10 ? `0${origMonth}` : origMonth;
                            results.push(`${origYear}-${mm}`)
                        }

                        return results
                    }
                    const prevMonths = getPreviousMonths(targetMonth, len)
                    let prevSpendings = 0

                    prevMonths.forEach((month) => {
                        const report = reports.find(r => r.targetMonth === month)
                        if (report) { prevSpendings += report.totalExpense }
                    })
                    spendingVsAverage = (prevSpendings / len) - totalExpense
                }


                let topCategory = '';
                let max = 0;
                spendingByCategory.forEach(({ category, amount }) => {
                    if (amount > max) {
                        max = amount;
                        topCategory = category;
                    }
                });

                const acknowledged = false
                const newMonthlyReport = new MonthlyReport({ userId, targetMonth, totalExpense, savedAmount, topCategory, spendingByCategory, spendingVsAverage, acknowledged })
                await newMonthlyReport.save()

                return {
                    id: newMonthlyReport._id.toString(),
                    ...newMonthlyReport.toObject()
                };
            } catch (err) {
                console.error("Error creating monthly report", err)
                throw new Error(err.message)
            }
        },

        updateAcknowledge: async (_, { id, acknowledged }) => {
            try {
                const updatedReport = await MonthlyReport.findByIdAndUpdate(id, { acknowledged }, { new: true })
                return {
                    id: updatedReport._id.toString(),
                    acknowledged: updatedReport.acknowledged
                };
            } catch (err) {
                throw new Error(err.message)
            }
        }
    }
}

module.exports = expenseResolvers
const Expense = require('../../models/expense')
const MonthlyReport = require('../../models/monthlyReport')
const User = require('../../models/user')

const formatExpense = (expense) => ({
    id: expense._id.toString(),
    ...expense.toObject()
})

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

        monthlyReports: async (_, { userId }) => {
            try {
                const reports = await MonthlyReport.find({ userId })

                return reports.map((report) => ({
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
                return  {
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
                const categories = ["MISC", "FOOD", "RENT", "TRANSPORT", "SUBSCRIPTION", "UTILITY", "GAMES"]
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
                const updatedReport = await MonthlyReport.findByIdAndUpdate(id, { acknowledged }, {new: true})
                return {
                    id: updatedReport._id.toString(),
                    acknowledged: updatedReport.acknowledged
                };
            } catch(err) {
                throw new Error(err.message)
            }
        }
    }
}

module.exports = expenseResolvers
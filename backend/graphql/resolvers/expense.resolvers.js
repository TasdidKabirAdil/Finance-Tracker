const Expense = require('../../models/expense')

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
                        const month = new Date(exp.date).toISOString().slice(0,7)  
                        return month === targetMonth
                    })
                    .reduce((sum, exp) => sum + exp.amount, 0)
                return total
            } catch (err) {
                console.error("Failed calculating total monthy expense", err)
                throw new Error(err.message)
            }
        }
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
        }
    }
}

module.exports = expenseResolvers
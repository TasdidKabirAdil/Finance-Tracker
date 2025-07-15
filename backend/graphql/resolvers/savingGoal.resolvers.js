const SavingGoal = require('../../models/savingGoal')
const MonthlyReport = require('../../models/monthlyReport')
const { suggestThresholds } = require('../../utils/geminiService')

const savingGoalResolvers = {
    Query: {
        savingGoal: async (_, { userId, month }) => {
            try {
                const goal = await SavingGoal.findOne({ userId, month })
                if (!goal) return null;
                return {
                    id: goal._id.toString(),
                    ...goal.toObject()
                }
            } catch (err) {
                console.log("Failed to fetch saving goal")
                throw new Error(err.message)
            }
        }
    },

    Mutation: {
        suggestSavingGoals: async (_, { userId, monthlyIncome, savingAmount }) => {
            try {
                // Fetch all existing monthly reports for the user
                const reports = await MonthlyReport.find({ userId });

                // Define all supported expense categories
                const categories = [
                    'MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION',
                    'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING',
                    'GIFT', 'HEALTHCARE', 'INSURANCE'
                ];

                let categoricalThresholds = [];

                // Generate target month string in format YYYY-MM
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;
                const mm = month < 10 ? `0${month}` : `${month}`;
                const targetMonth = `${year}-${mm}`;

                // Limit lookback to latest 3 reports (if more exist)
                let len = reports.length;
                if (len > 3) len = 3;

                // Only proceed if there’s historical data
                if (len > 0) {
                    // Helper function: get previous N months from targetMonth
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

                    // Get past N months and filter relevant reports
                    const prevMonths = getPreviousMonths(targetMonth, len);
                    const prevReports = reports.filter(report => prevMonths.includes(report.targetMonth));

                    // Track total and count per category for averaging
                    const categoryTotals = {};
                    const categoryCounts = {};
                    categories.forEach(category => {
                        categoryTotals[category] = 0;
                        categoryCounts[category] = 0;
                    });

                    // Accumulate amounts by category across previous reports
                    prevReports.forEach(report => {
                        report.spendingByCategory.forEach(({ category, amount }) => {
                            if (categories.includes(category)) {
                                categoryTotals[category] += amount;
                                categoryCounts[category] += 1;
                            }
                        });
                    });

                    // Compute average per category from previous reports
                    categoricalThresholds = categories
                        .filter(category => categoryCounts[category] > 0)
                        .map(category => ({
                            category,
                            amount: parseFloat((categoryTotals[category] / categoryCounts[category]).toFixed(2))
                        }));
                }

                // Return final thresholds using helper
                return await suggestThresholds({ monthlyIncome, savingAmount, categoricalThresholds });
            } catch (err) {
                throw new Error(err.message);
            }
        },


        addSavingGoal: async (_, { userId, month, savingAmount, categoricalThresholds }) => {
            try {
                const existing = await SavingGoal.findOne({ userId, month });
                if (existing) throw new Error('Saving goal already exists for this month.');

                const newGoal = new SavingGoal({ userId, month, savingAmount, categoricalThresholds });
                return await newGoal.save();
            } catch (err) {
                console.error('Error adding saving goal:', err);
                throw new Error(err.message);
            }
        },

        updateSavingGoal: async (_, { id, savingAmount, categoricalThresholds }) => {
            try {
                const updated = await SavingGoal.findByIdAndUpdate(
                    id,
                    { savingAmount, categoricalThresholds },
                    { new: true }
                );
                if (!updated) throw new Error('Saving goal not found.');
                return updated;
            } catch (err) {
                console.error('Error updating saving goal:', err);
                throw new Error(err.message);
            }
        },

        deleteSavingGoal: async (_, { id }) => {
            try {
                const goal = await SavingGoal.findByIdAndDelete(id)
                return { id: goal._id.toString() }
            } catch (err) {
                console.error('Error deleting saving goal:', err);
                throw new Error(err.message);
            }
        }
    }
}

module.exports = savingGoalResolvers
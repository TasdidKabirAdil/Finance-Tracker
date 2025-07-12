const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Expense = require('../models/expense')
const SavingGoal = require('../models/savingGoal');
const MonthlyReport = require('../models/monthlyReport');
const User = require('../models/user');
const generateReport = require('../utils/reportScheduler')
dotenv.config({ path: '../.env' })

const DEMO_EMAIL = 'demo@kaneflow.com';

async function resetDemoData() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')

        const demoUser = await User.findOne({ email: DEMO_EMAIL })
        if (!demoUser) {
            console.log("Demo user not found")
            return
        }

        const userId = demoUser._id
        console.log(userId)

        await User.findByIdAndUpdate(userId, {
            name: 'KaneFlow Demo',
            estimatedMonthlyIncome: 2000,
            address: '123 Demo Street',
            country: 'Canada',
            currency: 'CAD'
        });
        console.log('Demo user profile updated.');

        await Expense.deleteMany({ userId });
        await SavingGoal.deleteMany({ userId });
        await MonthlyReport.deleteMany({ userId });
        console.log('Cleared demo user data.');

        const demoExpenses = [
            // === May 2025 ===
            { name: 'Rent', category: 'RENT', amount: 500.00, date: new Date('2025-05-02') },
            { name: 'Drinking Mog', category: 'GIFT', amount: 35.00, date: new Date('2025-05-11') },
            { name: 'TTC', category: 'TRANSPORT', amount: 3.20, date: new Date('2025-05-13') },
            { name: 'Cigarettes', category: 'MISC', amount: 11.40, date: new Date('2025-05-15') },
            { name: 'Netflix', category: 'SUBSCRIPTION', amount: 12.00, date: new Date('2025-05-16') },
            { name: 'TTC Pass', category: 'TRANSPORT', amount: 122.00, date: new Date('2025-05-17') },
            { name: 'Groceries', category: 'FOOD', amount: 82.19, date: new Date('2025-05-21') },
            { name: 'Phone Bill', category: 'UTILITY', amount: 73.12, date: new Date('2025-05-23') },

            // === June 2025 ===
            { name: 'Rent', category: 'RENT', amount: 500.00, date: new Date('2025-06-01') },
            { name: 'Phone Bill', category: 'UTILITY', amount: 73.00, date: new Date('2025-06-02') },
            { name: 'TTC Pass', category: 'TRANSPORT', amount: 122.00, date: new Date('2025-06-02') },
            { name: 'Groceries', category: 'SHOPPING', amount: 140.00, date: new Date('2025-06-04') },
            { name: 'Lunch', category: 'FOOD', amount: 21.44, date: new Date('2025-06-08') },
            { name: 'Speakers', category: 'SHOPPING', amount: 40.00, date: new Date('2025-06-14') },
            { name: 'Medicine', category: 'HEALTHCARE', amount: 289.00, date: new Date('2025-06-19') },
            { name: 'Karaoke', category: 'ENTERTAINMENT', amount: 10.00, date: new Date('2025-06-25') },

            // === July 2025 ===
            { name: 'Phone Bill', category: 'UTILITY', amount: 73.00, date: new Date('2025-07-01') },
            { name: 'Rent', category: 'RENT', amount: 300.00, date: new Date('2025-07-02') },
            { name: 'Death Stranding 2', category: 'GAMES', amount: 101.00, date: new Date('2025-07-04') },
            { name: 'TTC', category: 'TRANSPORT', amount: 6.60, date: new Date('2025-07-07') },
            { name: 'Discord', category: 'SUBSCRIPTION', amount: 16.00, date: new Date('2025-07-07') },
            { name: 'T-shirt', category: 'SHOPPING', amount: 30.00, date: new Date('2025-07-08') },
            { name: 'Fast Food', category: 'FOOD', amount: 20.99, date: new Date('2025-07-09') },
            { name: 'Battery', category: 'MISC', amount: 10.00, date: new Date('2025-07-10') },
            { name: 'Table Lamp', category: 'GIFT', amount: 50.00, date: new Date('2025-07-11') },
        ];

        const expensesWithUser = demoExpenses.map(exp => ({ ...exp, userId }));
        await Expense.insertMany(expensesWithUser);

        console.log('Inserted demo expenses.')

        const prevMonths = getPreviousMonths(2)

        for (const month of prevMonths) {
            await generateReport(userId, month);
            console.log(`Generated monthly report for ${month}`);
        }

        const savingGoal = new SavingGoal({
            userId,
            month: '2025-07',
            savingAmount: 900,
            categoricalThresholds: [
                { category: 'MISC', amount: 20 },
                { category: 'RENT', amount: 500 },
                { category: 'TRANSPORT', amount: 86.52 },
                { category: 'FOOD', amount: 36.27 },
                { category: 'SUBSCRIPTION', amount: 30 },
                { category: 'UTILITY', amount: 100 },
                { category: 'SHOPPING', amount: 80 },
                { category: 'GIFT', amount: 35 },
                { category: 'HEALTHCARE', amount: 289 }
            ]
        })

        await savingGoal.save();
        console.log('Saving goal for July inserted.');

        process.exit(0);
    } catch (err) {
        console.error('Failed to reset demo account:', err);
        process.exit(1);
    }
}

function getPreviousMonths(n) {
    const now = new Date();
    let [year, month] = [now.getFullYear(), now.getMonth() + 1];

    const months = [];
    for (let i = 0; i < n; i++) {
        month--;
        if (month === 0) {
            month = 12;
            year--;
        }
        const mm = month < 10 ? `0${month}` : `${month}`;
        months.push(`${year}-${mm}`);
    }

    return months;
}


resetDemoData()
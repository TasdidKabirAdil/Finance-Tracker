const request = require('supertest');
const createApp = require('../server');
const Expense = require('../models/expense');
const User = require('../models/user');
const MonthlyReport = require('../models/monthlyReport');
const mongoose = require('mongoose');

let app;
let testUserId;
let testExpenseId;
let testReportId;

beforeAll(async () => {
    app = await createApp();
    testUserId = new mongoose.Types.ObjectId();

    await User.create({
        _id: testUserId,
        name: 'Test User',
        email: 'expense@test.com',
        password: 'test',
        estimatedMonthlyIncome: 2000,
    });

    const expense = await Expense.create({
        userId: testUserId,
        name: 'Sushi',
        category: 'FOOD',
        amount: 50,
        date: new Date(),
    });

    testExpenseId = expense._id;
});

afterAll(async () => {
    await Expense.deleteMany({ userId: testUserId });
    await User.deleteMany({ _id: testUserId });
    await MonthlyReport.deleteMany({ userId: testUserId });
    await mongoose.disconnect();
});

describe("Expense Graphql Query/Mutation", () => {
    it('returns null for non-existent expense', async () => {
        const query = `
            query Expense($id: ID!) {
                expense(id: $id) {
                    id
                    amount
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { id: new mongoose.Types.ObjectId().toString() },
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.expense).toBeNull();
    });

    it('dailyExpense returns 0 values when no data exists for today/yesterday', async () => {
        const query = `
            query DailyExpense($userId: ID!) {
                dailyExpense(userId: $userId) {
                    totalDailyExpense
                    prevDayComparison
                    numberOfExpense
                    topCategory
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { userId: new mongoose.Types.ObjectId().toString() },
        });

        expect(res.statusCode).toBe(200);
        const data = res.body.data.dailyExpense;
        expect(data.totalDailyExpense).toBe(0);
        expect(data.numberOfExpense).toBe(0);
        expect(typeof data.prevDayComparison).toBe('number');
        expect(typeof data.topCategory).toBe('string');
    });

    it('totalMonthlyExpense returns 0 for invalid user/month', async () => {
        const query = `
            query TotalMonthlyExpense($userId: ID!, $targetMonth: String!) {
                totalMonthlyExpense(userId: $userId, targetMonth: $targetMonth)
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: new mongoose.Types.ObjectId().toString(),
                targetMonth: '1999-01'
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.totalMonthlyExpense).toBe(0);
    });

    it('categoryExpense returns empty list for invalid user/month', async () => {
        const query = `
            query CategoryExpense($userId: ID!, $targetMonth: String!) {
                categoryExpense(userId: $userId, targetMonth: $targetMonth) {
                    category
                    amount
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: new mongoose.Types.ObjectId().toString(),
                targetMonth: '1999-01'
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.categoryExpense).toEqual([]);
    });

    it('monthlyTotal returns array even if no expenses exist', async () => {
        const query = `
            query MonthlyTotal($userId: ID!) {
                monthlyTotal(userId: $userId) {
                    month
                    amount
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: new mongoose.Types.ObjectId().toString()
            }
        });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data.monthlyTotal)).toBe(true);
    });

    it('typicalSpent returns 0 when no expenses exist for last 3 months', async () => {
        const query = `
            query TypicalSpent($userId: ID!) {
                typicalSpent(userId: $userId)
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { userId: new mongoose.Types.ObjectId().toString() }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.typicalSpent).toBe(0);
    });

    it('monthlyReports returns empty array for user with no reports', async () => {
        const query = `
            query MonthlyReports($userId: ID!) {
                    monthlyReports(userId: $userId) {
                    id
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { userId: new mongoose.Types.ObjectId().toString() }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.monthlyReports).toEqual([]);
    });

    it('monthlyReport returns null for missing month', async () => {
        const query = `
            query MonthlyReport($userId: ID!, $targetMonth: String!) {
                monthlyReport(userId: $userId, targetMonth: $targetMonth) {
                    id
                    targetMonth
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: new mongoose.Types.ObjectId().toString(),
                targetMonth: '1999-01'
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.monthlyReport).toBeNull();
    });

    it('adds a new expense', async () => {
        const query = `
            mutation AddExpense($userId: ID!, $name: String!, $category: Category!, $amount: Float!) {
                addExpense(userId: $userId, name: $name, category: $category, amount: $amount) {
                    id
                    name
                    amount
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: testUserId,
                name: 'Test Expense',
                category: 'FOOD',
                amount: 100,
                date: new Date().toISOString()
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.addExpense.name).toBe('Test Expense');
        testExpenseId = res.body.data.addExpense.id;
    });

    it('updates an existing expense', async () => {
        const query = `
            mutation UpdateExpense($updateExpenseId: ID!, $name: String, $category: Category, $amount: Float, $date: String) {
                updateExpense(id: $updateExpenseId, name: $name, category: $category, amount: $amount, date: $date)  {
                    id
                    name
                    amount
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                updateExpenseId: testExpenseId,
                name: 'Updated Expense',
                category: 'UTILITY',
                amount: 150,
                date: new Date().toISOString()
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.updateExpense.name).toBe('Updated Expense');
    });

    it('deletes an expense', async () => {
        const query = `
            mutation DeleteExpense($deleteExpenseId: ID!) {
                deleteExpense(id: $deleteExpenseId){
                    id
                    name
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { deleteExpenseId: testExpenseId }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.deleteExpense.name).toBe('Updated Expense');
    });

    it('adds a monthly report', async () => {
        const query = `
            mutation AddMonthlyReport($userId: ID!, $targetMonth: String!) {
                addMonthlyReport(userId: $userId, targetMonth: $targetMonth) {
                    id
                    targetMonth
                    totalExpense
                    savedAmount
                }
            }
        `;

        // Add a sample expense to current month
        const currentDate = new Date();
        await Expense.create({
            userId: testUserId,
            name: 'Current Month Expense',
            category: 'FOOD',
            amount: 500,
            date: currentDate
        });

        const monthKey = currentDate.toISOString().slice(0, 7);

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: testUserId,
                targetMonth: monthKey
            }
        });

        expect(res.statusCode).toBe(200);
        const report = res.body.data.addMonthlyReport;
        expect(report.totalExpense).toBeGreaterThan(0);
        testReportId = report.id;
    });

    it('updates acknowledge status in a report', async () => {
        const query = `
            mutation UpdateAcknowledge($id: ID!, $acknowledged: Boolean!) {
                updateAcknowledge(id: $id, acknowledged: $acknowledged) {
                    id
                    acknowledged
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                id: testReportId,
                acknowledged: true
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.updateAcknowledge.acknowledged).toBe(true);
    });
})
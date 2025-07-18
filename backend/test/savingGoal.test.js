const request = require('supertest');
const createApp = require('../server');
const mongoose = require('mongoose');
const User = require('../models/user');
const SavingGoal = require('../models/savingGoal');
const MonthlyReport = require('../models/monthlyReport');

// Mock the suggestThresholds util
jest.mock('../utils/geminiService', () => ({
    suggestThresholds: jest.fn(({ categoricalThresholds }) => {
        return {
            suggestedThresholds: categoricalThresholds.length > 0
                ? categoricalThresholds
                : [{ category: 'FOOD', amount: 300 }],
            recommendationNote: 'Mock suggestion'
        };
    })
}));

let app;
let testUserId;
let testSavingGoalId;

beforeAll(async () => {
    app = await createApp();

    testUserId = new mongoose.Types.ObjectId();

    await User.create({
        _id: testUserId,
        name: 'Goal User',
        email: 'goal@test.com',
        password: 'test',
        estimatedMonthlyIncome: 4000,
        verified: true
    });
});

afterAll(async () => {
    await SavingGoal.deleteMany({ userId: testUserId });
    await MonthlyReport.deleteMany({ userId: testUserId });
    await User.deleteMany({ _id: testUserId });
    await mongoose.disconnect();
});

describe('Saving Goal GraphQL Tests', () => {
    const targetMonth = new Date().toISOString().slice(0, 7);

    it('adds a saving goal', async () => {
        const query = `
            mutation AddSavingGoal($userId: ID!, $month: String!, $savingAmount: Float!, $categoricalThresholds: [CategoryThresholdInput!]!) {
                addSavingGoal(userId: $userId, month: $month, savingAmount: $savingAmount, categoricalThresholds: $categoricalThresholds) {
                    id
                    savingAmount
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: testUserId,
                month: targetMonth,
                savingAmount: 800,
                categoricalThresholds: [{ category: 'FOOD', amount: 200 }]
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.addSavingGoal.savingAmount).toBe(800);
        testSavingGoalId = res.body.data.addSavingGoal.id;
    });

    it('fetches saving goal by user and month', async () => {
        const query = `
            query SavingGoal($userId: ID!, $month: String!) {
                savingGoal(userId: $userId, month: $month) {
                    id
                    savingAmount
                    categoricalThresholds {
                        category
                        amount
                    }
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { userId: testUserId, month: targetMonth }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.savingGoal.categoricalThresholds.length).toBeGreaterThan(0);
    });

    it('updates saving goal', async () => {
        const query = `
            mutation UpdateSavingGoal($id: ID!, $savingAmount: Float!, $categoricalThresholds: [CategoryThresholdInput!]!) {
                updateSavingGoal(id: $id, savingAmount: $savingAmount, categoricalThresholds: $categoricalThresholds) {
                    id
                    savingAmount
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                id: testSavingGoalId,
                savingAmount: 1000,
                categoricalThresholds: [{ category: 'RENT', amount: 1200 }]
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.updateSavingGoal.savingAmount).toBe(1000);
    });

    it('suggests saving goals', async () => {
        const query = `
            mutation SuggestSavingGoals($userId: ID!, $savingAmount: Float!, $monthlyIncome: Float!) {
                suggestSavingGoals(userId: $userId, savingAmount: $savingAmount, monthlyIncome: $monthlyIncome) {
                    suggestedThresholds {
                        category
                        amount
                    }
                    recommendationNote
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                userId: testUserId,
                savingAmount: 1000,
                monthlyIncome: 4000
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.suggestSavingGoals.suggestedThresholds.length).toBeGreaterThan(0);
        expect(res.body.data.suggestSavingGoals.recommendationNote).toBe('Mock suggestion');
    });

    it('deletes saving goal', async () => {
        const query = `
            mutation DeleteSavingGoal($id: ID!) {
                deleteSavingGoal(id: $id) {
                    id
                }
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { id: testSavingGoalId }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.deleteSavingGoal.id).toBe(testSavingGoalId);
    });
});

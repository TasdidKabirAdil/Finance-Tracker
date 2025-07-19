import { gql } from "@apollo/client"

export const GET_EXPENSES = gql`
    query Expenses($userId: ID!) {
        expenses(userId: $userId) {
            id
            userId
            name
            category
            amount
            date
        }
    }
`

export const GET_EXPENSE = gql`
    query Expense($expenseId: ID!) {
        expense(id: $expenseId) {
            id
            userId
            name
            category
            amount
            date
        }
    }
`

export const GET_DAILY_REPORT = gql`
    query DailyExpense($userId: ID!, $targetDay: String!) {
        dailyExpense(userId: $userId, targetDay: $targetDay) {
            totalDailyExpense
            prevDayComparison
            topCategory
            numberOfExpense
        }
    }
`

export const GET_TOTAL_EXPENSE = gql`
    query Query($userId: ID!, $targetMonth: String!) {
        totalMonthlyExpense(userId: $userId, targetMonth: $targetMonth)
    }
`

export const GET_TYPICAL_SPENDING = gql`
    query Query($userId: ID!) {
        typicalSpent(userId: $userId)
    }
`

export const GET_MONTHLY_CHART = gql`
    query MonthlyTotal($userId: ID!) {
        monthlyTotal(userId: $userId) {
            month
            amount
        }
    }
`

export const GET_CATEGORY_EXPENSE = gql`
    query CategoryExpense($userId: ID!, $targetMonth: String!) {
        categoryExpense(userId: $userId, targetMonth: $targetMonth) {
            category
            amount
        }
    }
`

export const GET_REPORTS = gql`
    query MonthlyReports($userId: ID!) {
        monthlyReports(userId: $userId) {
            id
            userId
            targetMonth
            totalExpense
            savedAmount
            topCategory
            spendingByCategory {
                category
                amount
            }
            spendingVsAverage
        }
    }
`

export const GET_REPORT = gql`
    query MonthlyReport($userId: ID!, $targetMonth: String!) {
        monthlyReport(userId: $userId, targetMonth: $targetMonth) {
            id
            userId
            targetMonth
            totalExpense
            savedAmount
            topCategory
            spendingByCategory {
                amount
                category
            }
            spendingVsAverage
            acknowledged
        }
    }
`
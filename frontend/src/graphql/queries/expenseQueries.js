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

export const GET_TOTAL_EXPENSE = gql`
    query Query($userId: ID!, $targetMonth: String!) {
        totalMonthlyExpense(userId: $userId, targetMonth: $targetMonth)
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
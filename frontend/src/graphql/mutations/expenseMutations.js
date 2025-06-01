import { gql } from "@apollo/client"

export const ADD_EXPENSE = gql`
    mutation AddExpense($userId: ID!, $name: String!, $category: Category!, $amount: Float!, $date: String!) {
        addExpense(userId: $userId, name: $name, category: $category, amount: $amount, date: $date) {
            id
        }
    }
`

export const UPDATE_EXPENSE = gql`
    mutation UpdateExpense($updateExpenseId: ID!, $name: String, $category: Category, $amount: Float, $date: String) {
        updateExpense(id: $updateExpenseId, name: $name, category: $category, amount: $amount, date: $date) {
            id
        }
    }
`

export const DELETE_EXPENSE = gql`
    mutation DeleteExpense($deleteExpenseId: ID!) {
        deleteExpense(id: $deleteExpenseId) {
            id
        }
    }
`
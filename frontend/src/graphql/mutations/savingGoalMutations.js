import { gql } from "@apollo/client"

export const REQ_SUGGESTION = gql`
    mutation SuggestSavingGoals($userId: ID!, $savingAmount: Float!, $monthlyIncome: Float!) {
        suggestSavingGoals(userId: $userId, savingAmount: $savingAmount, monthlyIncome: $monthlyIncome) {
            suggestedThresholds {
                amount
                category
            }
            recommendationNote
        }
    }
`

export const ADD_SAVING_GOAL = gql`
    mutation AddSavingGoal($userId: ID!, $month: String!, $savingAmount: Float!, $categoricalThresholds: [CategoryThresholdInput!]!) {
        addSavingGoal(userId: $userId, month: $month, savingAmount: $savingAmount, categoricalThresholds: $categoricalThresholds) {
            id
            userId
            month
            savingAmount
            categoricalThresholds {
                category
                amount
            }
        }
    }
`

export const UPDATE_SAVING_GOAL = gql`
    mutation UpdateSavingGoal($updateSavingGoalId: ID!, $savingAmount: Float!, $categoricalThresholds: [CategoryThresholdInput!]!) {
        updateSavingGoal(id: $updateSavingGoalId, savingAmount: $savingAmount, categoricalThresholds: $categoricalThresholds) {
            id
            userId
            month
            savingAmount
            categoricalThresholds {
                category
                amount
            }
        }
    }
`

export const DELETE_SAVING_GOAL = gql`
    mutation DeleteSavingGoal($deleteSavingGoalId: ID!) {
        deleteSavingGoal(id: $deleteSavingGoalId) {
            id
        }
    }
`
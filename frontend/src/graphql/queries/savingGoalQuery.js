import { gql } from "@apollo/client"

export const GET_GOAL = gql`
    query SavingGoal($userId: ID!, $month: String!) {
        savingGoal(userId: $userId, month: $month) {
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
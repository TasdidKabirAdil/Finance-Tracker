import { gql } from '@apollo/client'

export const GET_USER = gql`
    query User($userId: ID!) {
        user(id: $userId) {
            id
            name
            email
            estimatedMonthlyIncome
            verified
            address
            country
            currency
            createdAt
            updatedAt
        }
    }
`

export const GET_USER_CURRENCY = gql`
    query User($userId: ID!) {
        user(id: $userId) {
            currency
        }
    }
`
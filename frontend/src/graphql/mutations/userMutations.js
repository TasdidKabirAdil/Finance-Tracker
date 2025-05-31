import { gql } from '@apollo/client'

export const REGISTER = gql`
    mutation Register($name: String!, $email: String!, $password: String!, $estimatedMonthlyIncome: Float!, $currency: String) {
        register(name: $name, email: $email, password: $password, estimatedMonthlyIncome: $estimatedMonthlyIncome, currency: $currency) {
            id
            name
            email
            estimatedMonthlyIncome
            verificationToken
            createdAt
            updatedAt
        }
    }
`

export const LOGIN = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                id
                name
                email
                verified
            }
        }
    }
`

export const RESEND_VERIFICATION = gql`
    mutation ResendVerificationEmail($email: String!) {
        resendVerificationEmail(email: $email)
    }
`

export const RESET_PASSWORD = gql`
    mutation ResetPassword($email: String!) {
        resetPassword(email: $email)
    }
`

export const CONFIRM_PASSWORD = gql`
    mutation ConfirmResetPassword($token: String!, $newPassword: String!) {
        confirmResetPassword(token: $token, newPassword: $newPassword)
    }
`

export const UPDATE_USER = gql`
    mutation UpdateProfile($updateProfileId: ID!, $name: String, $estimatedMonthlyIncome: Float, $address: String, $country: String, $currency: String) {
        updateProfile(id: $updateProfileId, name: $name, estimatedMonthlyIncome: $estimatedMonthlyIncome, address: $address, country: $country, currency: $currency) {
            id
            name
            estimatedMonthlyIncome
            address
            country
            currency
            updatedAt
        }
    }
`
const userTypeDefs = `#graphql
    type User {
        id: ID!
        name: String!
        email: String!
        password: String!
        estimatedMonthlyIncome: Float!
        verified: Boolean!
        verificationToken: String
        verificationExpires: String
        resetPwdToken: String
        resetPwdExpires: String
        address: String
        country: String
        currency: String
        createdAt: String
        updatedAt: String
    }

    type Query {
        users: [User]
        user(id: ID!): User
    }

    type Mutation {
        login(email: String! password: String!): AuthPayload
        register(
            name: String!
            email: String!
            password: String!
            estimatedMonthlyIncome: Float!
            currency: String
        ): User

        verifyEmail(token: String!): Boolean
        resendVerificationEmail(email: String!): Boolean
        resetPassword(email: String!): Boolean
        confirmResetPassword(token: String!, newPassword: String!): Boolean

        updateProfile(
            id: ID!
            name: String
            estimatedMonthlyIncome: Float     
            address: String
            country: String
            currency: String
        ) : User

        deleteUser (id: ID!) : Boolean
    }

    type AuthPayload {
        token: String
        user: User
    }
`

module.exports = userTypeDefs
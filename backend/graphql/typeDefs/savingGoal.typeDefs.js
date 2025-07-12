const savingGoalTypeDefs = `#graphql
    type CategoryThreshold {
        category: String!
        amount: Float!
    }

    input CategoryThresholdInput {
        category: String!
        amount: Float!
    }

    type SavingGoal {
        id: ID!
        userId: ID!
        month: String!
        savingAmount: Float!
        categoricalThresholds: [CategoryThreshold!]
    }

    type Query {
        savingGoal(
            userId: ID!
            month: String!
        ) : SavingGoal
    }

    type SuggestSavingGoalsPayload {
        suggestedThresholds: [CategoryThreshold!]!
        recommendationNote: String
    }

    type Mutation {
        suggestSavingGoals (
            userId: ID!
            savingAmount: Float!
            monthlyIncome: Float!
        ): SuggestSavingGoalsPayload

        addSavingGoal(
            userId: ID!
            month: String!
            savingAmount: Float!
            categoricalThresholds: [CategoryThresholdInput!]!
        ): SavingGoal

        updateSavingGoal(
            id: ID!
            savingAmount: Float!
            categoricalThresholds: [CategoryThresholdInput!]!
        ): SavingGoal

        deleteSavingGoal(id: ID!): SavingGoal
    }
`

module.exports = savingGoalTypeDefs
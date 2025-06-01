const expenseTypeDefs = `#graphql
    enum Category {
        MISC
        FOOD
        RENT
        TRANSPORT
        SUBSCRIPTION
        UTILITY
        GAMES
    }
    
    type Expense {
        id: ID!
        userId: ID!
        name: String!
        category: Category!
        amount: Float!
        date: String!
    }

    type Query {
        expenses(userId: ID!): [Expense]
        expense(id: ID!): Expense
        totalMonthlyExpense(userId: ID!, targetMonth: String!) : Float
    }

    type Mutation {
        addExpense(
            userId: ID!
            name: String!
            category: Category!
            amount: Float!
            date: String
        ) : Expense

        updateExpense(
            id: ID!
            name: String
            category: Category
            amount: Float
            date: String
        ): Expense

        deleteExpense(id: ID!) : Expense     
    }
`

module.exports = expenseTypeDefs
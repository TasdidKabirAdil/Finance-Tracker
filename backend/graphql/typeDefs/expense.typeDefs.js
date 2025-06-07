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

    type CategorySpending {
        category: String!
        amount: Float!
    }

    type MonthlyReport {
        id: ID!
        userId: ID!
        targetMonth: String!
        totalExpense: Float!
        savedAmount: Float!
        topCategory: String!
        spendingByCategory: [CategorySpending!]
        spendingVsAverage: Float
        acknowledged: Boolean
    }

    type Query {
        expenses(userId: ID!): [Expense]
        expense(id: ID!): Expense
        totalMonthlyExpense(userId: ID!, targetMonth: String!) : Float
        monthlyReports(userId: ID!) : [MonthlyReport]
        monthlyReport(userId: ID! targetMonth: String!) : MonthlyReport
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

        addMonthlyReport(
            userId: ID!
            targetMonth: String!
        ) : MonthlyReport

        updateAcknowledge(
            id: ID!
            acknowledged: Boolean!
        ) : MonthlyReport
    }
`

module.exports = expenseTypeDefs
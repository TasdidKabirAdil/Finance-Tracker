const expenseTypeDefs = `#graphql
    enum Category {
        MISC
        FOOD
        RENT
        TRANSPORT
        SUBSCRIPTION
        UTILITY
        GAMES
        ENTERTAINMENT
        SHOPPING
        GIFT
        HEALTHCARE
        INSURANCE
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

    type DailySpending {
        totalDailyExpense: Float!
        prevDayComparison: Float!
        numberOfExpense: Int!
        topCategory: String!
    }

    type MonthlyTotal {
        month: String!
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
        dailyExpense(userId: ID!) : DailySpending
        totalMonthlyExpense(userId: ID!, targetMonth: String!) : Float
        categoryExpense(userId: ID!, targetMonth: String!) : [CategorySpending!]
        monthlyTotal(userId: ID!) : [MonthlyTotal!]
        monthlyReports(userId: ID!) : [MonthlyReport]
        typicalSpent(userId: ID!) : Float
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
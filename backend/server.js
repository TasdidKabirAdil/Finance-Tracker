require('dotenv').config();
require('./utils/reportScheduler');
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { ApolloServer } = require('@apollo/server');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge')
const { expressMiddleware } = require('@apollo/server/express4')
const configureMongoose = require('./configs/mongoose');
const userTypeDefs = require('./graphql/typeDefs/user.typeDefs')
const expenseTypeDefs = require('./graphql/typeDefs/expense.typeDefs')
const savingGoalTypeDefs = require('./graphql/typeDefs/savingGoal.typeDefs')
const userResolvers = require('./graphql/resolvers/user.resolvers')
const expenseResolvers = require('./graphql/resolvers/expense.resolvers')
const savingGoalResolvers = require('./graphql/resolvers/savingGoal.resolvers')
const authRoutes = require('./auth/auth')

const startServer = async () => {
    await configureMongoose();
    const app = express();
    app.use(
        cors({
            origin: [
                'http://localhost:3000',
                'https://studio.apollographql.com',
                'http://10.0.0.186:3000'],
            credentials: true,
        })
    );
    app.use(cookieParser());
    app.use(express.json());
    app.use('/', authRoutes);

    const typeDefs = mergeTypeDefs([userTypeDefs, expenseTypeDefs, savingGoalTypeDefs])
    const resolvers = mergeResolvers([userResolvers, expenseResolvers, savingGoalResolvers])
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();

    app.use(
        '/graphql',
        cors({
            origin: [
                'http://localhost:3000', 
                'https://studio.apollographql.com', 
                'http://10.0.0.186:3000'],
            credentials: true,
        }),
        express.json(),
        expressMiddleware(apolloServer, {
            context: async ({ req, res }) => ({ req, res }),
        })
    );

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
};

startServer();
require('dotenv').config(); // Load environment variables
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4')
const configureMongoose = require('./configs/mongoose');
const typeDefs = require('./graphql/typeDefs/user.typeDefs')
const resolvers = require('./graphql/resolvers/user.resolvers')
const authRoutes = require('./auth/auth')

const startServer = async () => {
    await configureMongoose();
    const app = express();
    app.use(
        cors({
            origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
            credentials: true,
        })
    );
    app.use(cookieParser());
    app.use(express.json());
    app.use('/', authRoutes);
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();

    app.use(
        '/graphql',
        cors({
            origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
            credentials: true,
        }),
        express.json(),
        expressMiddleware(apolloServer, {
            context: async ({ req, res }) => ({ req, res }),
        })
    );

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
};

startServer();
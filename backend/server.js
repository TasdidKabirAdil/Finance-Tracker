require('dotenv').config(); // Load environment variables
const express = require('express')
const cors =  require('cors')
const cookieParser = require('cookie-parser')
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const configureMongoose = require('./configs/mongoose');
const typeDefs = require('./graphql/typeDefs/user-typeDefs')
const resolvers = require('./graphql/resolvers/user-resolvers')

const startServer = async () => {
    const app = express()

    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }))

    app.use(cookieParser())

    await configureMongoose();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });

    console.log(`🚀 GraphQL server ready at ${url}`);
};

startServer();
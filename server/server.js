// Import necessary Node modules
const express = require('express');
const path = require('path');
// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3001;
// Import custom authentication middleware for Express
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
// Create a new ApolloServer passing in typeDefs and resolvers
const server = new ApolloServer({
    typeDefs,
    resolvers,
});


const startApolloServer = async () => {
    await server.start();
    
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
  
    app.use('/graphql', expressMiddleware(server));
  
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/dist')));
  
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      });
    } 
  
    db.once('open', () => {
      app.listen(PORT, () => {
        console.log(`API server running on port http://localhost:${PORT}!`);
        console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
      });
    });
  };
  
  startApolloServer();
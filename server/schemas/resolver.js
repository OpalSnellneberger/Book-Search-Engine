// Import necessary modules and utilities
const { User, Book } = require('../models'); // Importing User and Book models
const { AuthenticationError } = require('apollo-server-express'); // Importing AuthenticationError from apollo-server-express
const { signToken } = require('../utils/auth'); // Importing signToken function from auth utility

// Define resolver functions
const resolvers = { 
  Query: {
    // Resolver function for 'me' query
    me: async (parent, args, context) => {
      // Check if user is authenticated
      if (context.user) {
        // If authenticated, retrieve user data excluding '__v' and 'password' fields, and populate 'savedBooks' array
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');
          
        return userData; // Return user data
      }

      throw new AuthenticationError('Not logged in'); // If user is not authenticated, throw AuthenticationError
    },
  },
  Mutation: {
    // Resolver function for 'login' mutation
    login: async (parent, { email, password }) => {
      // Find user by email
      const user = await User.findOne({ email });

      // If user not found, throw AuthenticationError
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
      
      // Check if password is correct
      const correctPw = await user.isCorrectPassword(password);

      // If password is incorrect, throw AuthenticationError
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // If authentication successful, generate token and return token along with user data
      const token = signToken(user);
      return { token, user };
    },

    // Resolver function for 'addUser' mutation
    addUser: async (parent, args) => {
      // Create new user with provided arguments
      const user = await User.create(args);
      
      // Generate token for newly created user
      const token = signToken(user);
    
      return { token, user }; // Return token and user data
    },

    // Resolver function for 'removeBook' mutation
    removeBook: async (parent, { bookId }, context) => {
      // Check if user is authenticated
      if (context.user) {
        // If authenticated, remove book with given bookId from user's savedBooks array and return updated user data
        const updatedBooks = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedBooks; // Return updated user data
      }
    },

    // Resolver function for 'saveBook' mutation
    saveBook: async (parent, { bookToSave }, context) => {
      // Check if user is authenticated
      if (context.user) {
        // If authenticated, add bookToSave to user's savedBooks array and return updated user data with savedBooks populated
        const updatedBooks = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookToSave } },
          { new: true }
        ).populate('savedBooks');

        return updatedBooks; // Return updated user data
      }

      throw new AuthenticationError('You need to be logged in!'); // If user is not authenticated, throw AuthenticationError
    },
  },
};

module.exports = resolvers; // Export resolvers

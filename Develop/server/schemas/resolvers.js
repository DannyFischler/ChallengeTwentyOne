const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // Resolver for getting a single user
    me: async (_, args, context) => {
      if (context.user) {
        const foundUser = await User.findOne({ _id: context.user._id }).populate('savedBooks');
        return foundUser;
      }
      throw new Error('Not logged in');
    },
  },
  Mutation: {
    // Resolver for creating a user
    addUser: async (_, args) => {
      const user = await User.create(args);
      if (!user) {
        throw new Error('Something went wrong!');
      }
      const token = signToken(user);
      return { token, user };
    },

    // Resolver for logging in a user
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new Error('Wrong password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    // Resolver for saving a book
    saveBook: async (_, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      throw new Error('Not logged in');
    },

    // Resolver for removing a book
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error("Couldn't find user with this id!");
        }
        return updatedUser;
      }
      throw new Error('Not logged in');
    },
  },
};

module.exports = resolvers;

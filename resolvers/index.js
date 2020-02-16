const Query = require("./Query");
const Mutation = require("./Mutation");
const Type = require("./Type");

module.exports = {
  Query,
  Mutation,
  Subscription: {
    newPhoto: {
      subscribe: (parent, args, { pubsub }) =>
        pubsub.asyncIterator("photo-added")
    },
    newUser: {
      subscribe: (parent, args, { pubsub }) =>
        pubsub.asyncIterator("user-added")
    }
  },
  ...Type
};

const { photos, tags } = require("../data");

module.exports = {
  totalPhotos: (parent, args, { db }) =>
    db.collection("photos").estimateDocumentCount(),
  allPhotos: (parent, args, { db }) =>
    db
      .collection("photos")
      .find()
      .toArray(),
  totalUsers: (parent, args, { db }) =>
    db.collection("users").estimateDocumentCount(),
  allUsers: (parent, args, { db }) =>
    db
      .collection("users")
      .find()
      .toArray()
};

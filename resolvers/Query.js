const { photos, tags } = require("../data");

module.exports = {
  totalPhotos: () => photos.length,
  allPhotos: () => photos
};

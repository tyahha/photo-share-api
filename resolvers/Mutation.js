const { _id, photos } = require("../data");
const { authorizeWithGithub } = require("../lib");

module.exports = {
  postPhoto(parent, args) {
    const newPhoto = {
      id: _id++,
      ...args.input,
      created: new Date()
    };
    photos.push(newPhoto);
    return newPhoto;
  },
  async githubAuth(parent, { code }, { db }) {
    const {
      message,
      access_token,
      avatar_url,
      login,
      name
    } = await authorizeWithGithub({
      client_id: "e066004cbfb0e8d2b533",
      client_secret: "84559dd1d138c7482b75f9b07350f7e261300441",
      code
    });

    if (message) {
      throw new Error(message);
    }

    const latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url
    };

    const {
      ops: [user]
    } = await db
      .collection("users")
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

    return { user, token: access_token };
  }
};

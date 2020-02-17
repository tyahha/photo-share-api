const { authorizeWithGithub, uploadStream } = require("../lib");
const path = require("path");
const fetch = require("node-fetch");

module.exports = {
  async postPhoto(parent, args, { db, currentUser, pubsub }) {
    if (!currentUser) {
      throw new Error("only an authorized user can post a photo");
    }

    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date()
    };

    const { insertedIds } = await db.collection("photos").insert(newPhoto);
    newPhoto.id = insertedIds[0];

    const toPath = path.join(
      __dirname,
      "..",
      "assets",
      "photos",
      `${newPhoto.id}.jpg`
    );

    const { stream } = await args.input.file;
    await uploadStream(stream, toPath);

    pubsub.publish("photo-added", { newPhoto });

    return newPhoto;
  },
  async githubAuth(parent, { code }, { db, pubsub }) {
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
      ops: [user],
      result
    } = await db
      .collection("users")
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

    result.upserted && pubsub.publish("user-added", { newUser: user });

    return { user, token: access_token };
  },
  addFakeUsers: async (root, { count }, { db, pubsub }) => {
    const randomeUserApi = `https://randomuser.me/api/?results=${count}`;
    const { results } = await fetch(randomeUserApi).then(res => res.json());

    const users = results.map(r => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1
    }));

    await db.collection("users").insert(users);

    users.forEach(newUser => {
      pubsub.publish("user-added", { newUser });
    });

    return users;
  },
  fakeUserAuth: async (parent, { githubLogin }, { db }) => {
    const user = await db.collection("users").findOne({ githubLogin });

    if (!user) {
      throw new Error(`Cannot find user with githubLogin ${githubLogin}`);
    }

    return {
      token: user.githubLogin,
      user
    };
  }
};

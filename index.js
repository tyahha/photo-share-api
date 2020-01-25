const { ApolloServer } = require("apollo-server");

const typeDefs = `
  # Photo型を定義します
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(name: String!, description: String): Photo!
  }
`;

let _id = 0;
const photos = [];

const resolvers = {
  Query: {
    // 写真を格納した配列の長さを変えs
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },

  // postPhotoミューテーションと対応するリゾルバ
  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args
      };
      photos.push(newPhoto);
      return newPhoto;
    }
  },
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`
  }
};

// サーバーのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数にとる
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// Webサーバーを起動
server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));

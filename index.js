const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const { GraphQLScalarType } = require("graphql");

const typeDefs = `
  scalar DateTime
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LNDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  type Query {
    totalPhotos: Int!
    allPhotos(after: DateTime): [Photo!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

const users = [
  { githubLogin: "mHattrup", name: "Mike Hattrup" },
  { githubLogin: "gPlake", name: "Glen Plake" },
  { githubLogin: "sSchmidt", name: "Scot Schmidt" }
];

let _id = 4;
const photos = [
  {
    id: "1",
    name: "Dropping the Heart Chute",
    description: "The heart chute is one of my favarite chutes",
    category: "ACTION",
    githubUser: "gPlake",
    created: "3-28-1977"
  },
  {
    id: "2",
    name: "Enjoying the sunshine",
    category: "SELFIE",
    githubUser: "sSchmidt",
    created: "1-2-1985"
  },
  {
    id: "3",
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
    created: "2018-04-15T19:09:57.308Z"
  }
];

const tags = [
  { photoID: "1", userID: "gPlake" },
  { photoID: "2", userID: "gPlake" },
  { photoID: "2", userID: "sSchmidt" },
  { photoID: "2", userID: "mHattrup" }
];

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
        ...args.input,
        created: new Date()
      };
      photos.push(newPhoto);
      return newPhoto;
    }
  },
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy(parent) {
      return users.find(u => u.githubLogin === parent.githubUser);
    },
    taggedUsers(parent) {
      return tags
        .filter(tag => tag.photoID === parent.id)
        .map(tag => tag.userID)
        .map(userID => users.find(u => u.githubLogin === userID));
    }
  },
  User: {
    postedPhotos(parent) {
      return photos.filter(p => p.githubUser === parent.githubLogin);
    },
    inPhotos(parent) {
      return tags
        .filter(tag => tag.userID === parent.id)
        .map(tag => tag.photoID)
        .map(photoID => photos.find(p => p.id === photoID));
    }
  },
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "A valid date time value",
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
};

const app = express();

// サーバーのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数にとる
const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.applyMiddleware({ app });

app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));

app.listen({ port: 4000 }, () =>
  console.log(
    `GraphQL Service running @ http://localhost:4000${server.graphqlPath}`
  )
);

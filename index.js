const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPlayground = require("graphql-playground-middleware-express")
  .default;
const { readFileSync } = require("fs");
const resolvers = require("./resolvers");

const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");

const app = express();

// サーバーのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数にとる
const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.applyMiddleware({ app });

app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
app.get("/playground", expressPlayground({ endpont: "/graphql" }));

app.listen({ port: 4000 }, () =>
  console.log(
    `GraphQL Service running @ http://localhost:4000${server.graphqlPath}`
  )
);

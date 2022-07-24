const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
require("dotenv/config");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");

const app = express();

const httpServer = http.createServer(app);
const server = new ApolloServer({
  introspection: true,
  typeDefs,
  resolvers,
  // csrfPrevention: true,
  cache: "bounded",
  context: (request) => {
    const header = request.req.headers.authorization;

    // not found
    if (!header) return { isAuth: false };

    // token
    const token = header.split(" ");

    // token not found
    if (!token) return { isAuth: false };

    let decodeToken;

    try {
      decodeToken = jwt.verify(token[1], "UNSAFESTRING");
    } catch (err) {
      return { isAuth: false };
    }

    // in case any error found
    if (!decodeToken) return { isAuth: false };
    // token decoded successfully, and extracted data
    return { isAuth: true, user_id: decodeToken.user_id };
  },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true }, async () => {
  await server.start();
  server.applyMiddleware({ app, path: "/" });
  await new Promise((resolve) =>
    httpServer.listen({ port: process.env.PORT || 4000 })
  );
  console.log(
    `🚀 Server ready at https://eyob-chatting-app-backend.herokuapp.com${server.graphqlPath}`
  );
});

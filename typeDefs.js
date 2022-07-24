const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    username: String
    email: String
    password: String
    token: String
  }

  type Message {
    text: String
    senderEmail: String
    recieverEmail: String
    createdTime: String
  }

  input RegisterInput {
    username: String
    email: String
    password: String
  }

  input LoginInput {
    email: String
    password: String
  }

  input SaveMessageInput {
    text: String
    senderEmail: String
    recieverEmail: String
  }

  type Query {
    user: User
    messages(recieverEmail: String, senderEmail: String): [Message]
    users: [User]
  }

  type Mutation {
    saveMessage(saveMessageInput: SaveMessageInput): Message
    registerUser(registerInput: RegisterInput): User
    loginUser(loginInput: LoginInput): User
  }
`;

module.exports = typeDefs;

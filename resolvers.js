const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const { ApolloError } = require("apollo-server-express");
const Message = require("./models/Message");

const resolvers = {
  Mutation: {
    async saveMessage(
      _,
      { saveMessageInput: { text, senderEmail, recieverEmail } }
    ) {
      const newMessage = new Message({
        text,
        senderEmail,
        recieverEmail,
      });

      const senderUser = await User.findOne({ email: senderEmail });
      if (!senderUser)
        throw new ApolloError("Sender not found", "SENDER NOT FOUND");

      const recieverUser = await User.findOne({ email: recieverEmail });
      if (!recieverUser)
        throw new ApolloError("Reciever not found", "RECIEVER NOT FOUND");

      if (senderEmail === recieverEmail)
        throw new ApolloError("Cannot send to the same email", "SAME EMAIL");

      const message = await newMessage.save();

      return message;
    },
    async registerUser(_, { registerInput: { username, email, password } }) {
      const oldUser = await User.findOne({ email });

      if (oldUser) {
        throw new ApolloError(
          "A user is already registered with the email: " + email,
          "USER_ALREADY_EXISTS"
        );
      }

      var encryptedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: encryptedPassword,
      });

      const token = jwt.sign({ user_id: newUser._id, email }, "UNSAFESTRING", {
        expiresIn: "2h",
      });

      newUser.token = token;

      const res = await newUser.save();

      return {
        id: res.id,
        ...res._doc,
      };
    },
    async loginUser(_, { loginInput: { email, password } }) {
      const user = await User.findOne({ email });

      if (!user) {
        throw new ApolloError("Incorrect email", "INCORRECT EMAIL");
      }

      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign({ user_id: user._id, email }, "UNSAFESTRING", {
          expiresIn: "2h",
        });

        // save user token
        user.token = token;

        return {
          id: user.id,
          ...user._doc,
        };
      } else {
        throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
      }
    },
  },
  Query: {
    user: async (_, __, { isAuth, user_id }) => {
      if (isAuth) {
        return await User.findById(user_id);
      }

      throw new ApolloError("User is not authenticated");
    },
  },
};

module.exports = resolvers;

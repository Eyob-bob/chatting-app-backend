const { model, Schema } = require("mongoose");

const MessageSchema = new Schema({
  text: { type: String, required: true },
  senderEmail: { type: String, required: true },
  recieverEmail: { type: String, required: true },
  createdTime: { type: Date, default: Date.now },
});

module.exports = model("message", MessageSchema);

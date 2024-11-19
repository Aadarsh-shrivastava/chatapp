import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const chatSchema = mongoose.Schema(
  {
    chatName: { type: String, required: true },
    isGroupChat: { type: Boolean, reuired: true, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    groupAdmins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;

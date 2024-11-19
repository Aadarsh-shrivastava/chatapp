import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    user_avatar: {
      type: String,
      required: false,
    },
    message_text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

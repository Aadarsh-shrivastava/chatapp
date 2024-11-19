import asyncHandler from "express-async-handler";
import Message from "../models/message.js";

//@description     Get all the messages
//@route           GET /api/message/:chatId
//@access          Public
const allMessages = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name", "pic")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    console.log(error);
    throw new Error(error.messages);
  }
});

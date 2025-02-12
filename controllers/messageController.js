import asyncHandler from "express-async-handler";
import Message from "../models/message.js";
import Chat from "../models/chat.js";

//@description     Get all the messages
//@route           GET /api/message/:chatId
//@access          Protected
export const allMessages = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    console.log(error);
    throw new Error(error.messages);
  }
});

//@description     Send message
//@route           GET /api/message/
//@access          Protected
export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { content, chatId } = req.body;
    console.log("sending message", chatId);

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) res.send("Chat not found");

    console.log("chat found", chat);
    const newMessage = await Message.create({
      sender: req.user._id, // Assuming req.user contains the sender's data
      chat: chatId,
      content: content,
    });

    chat.latestMessage = newMessage._id;
    await chat.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email") // Assuming `sender` refers to a User
      .populate("chat");

    res.json(populatedMessage);
  } catch (error) {
    res.status(400);
    console.log(error);
    throw new Error(error.messages);
  }
});

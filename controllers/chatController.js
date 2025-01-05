import asyncHandler from "express-async-handler";
import Chat from "../models/chat.js";
import User from "../models/user.js";

//@description     Create or fetch One to One Chat
//@route           GET /api/chat/
//@access          Protected
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with the request");
    return res.statusCode(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [userId, req.user._id],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
export const fetchAllChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(userId, userId);
  if (!userId) {
    console.log("User not authorized");
    return res.status(400).send("User not authorized");
  }

  try {
    const allChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const fullChats = await Chat.populate(allChats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    if (fullChats) {
      res.status(200).send(fullChats);
    }
  } catch (error) {
    res.status(400);
    console.log(error.message);
    throw new Error("Coulcn't Fetch the chats", error.message);
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/group
//@access          Protected
export const createGroupChats = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: "Please fill all the fields" });
  }

  const members = req.body.users;

  members.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: members,
      groupAdmin: [req.user],
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-passwords")
      .populate("groupAdmins", "-passwords");

    res.status(200).send(fullGroupChat);
  } catch (error) {
    res.status(400);
    console.log(error.message);
    throw new Error("Coulcn't Create a group chats", error.message);
  }
});

//@description     RenameGroup
//@route           GET /api/chat/group/rename
//@access          Protected
export const RenameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      { new: true }
    );

    if (!updatedChat) {
      res.status(404).send("chat not found");
    }

    res.send(updatedChat);
  } catch (error) {
    res.send(error);
    console.log(error.message);
    throw new Error("Coulcn't Fetch the chats", error.message);
  }
});

//@description     add use to a group
//@route           GET /api/chat/group/add
//@access          Protected
export const addUserToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const addedToChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { user: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(addedToChat);
    }
  } catch (error) {
    res.send(error);
    console.log(error.message);
    throw new Error("Coulcn't Fetch the chats", error.message);
  }
});

//@description     leave grup
//@route           GET /api/chat/group/leave
//@access          Protected
export const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Coulcn't Fetch the chats", error.message);
  }
});

import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import generateJWTToken from "../utils/generateToken.js";

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
export const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  console.log(search, keyword);
  const users = await User.find(keyword);
  // .find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     register new user
//@route           POST /api/user
//@access          Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res
      .status(400)
      .send(
        "Please Provide all the required fields, namely (name,email,password) "
      );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400).send("User Already Exists");
  }

  const user = await User.create({ name, email, password, pic });

  if (user) {
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateJWTToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Authenticate user
//@route           POST /api/user/login
//@access          Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);
  const user = await User.findOne({ email });

  if (user && (await user.matchPasswords(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateJWTToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//@description     Add a user (admin only)
//@route           POST /api/user/admin/add
//@access          Admin
export const addUserByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, pic, isAdmin } = req.body;

  if (!name || !email || !password) {
    res
      .status(400)
      .send(
        "Please Provide all the required fields, namely (name,email,password)"
      );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400).send("User Already Exists");
  }

  const user = await User.create({ name, email, password, pic, isAdmin });

  if (user) {
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("User creation failed");
  }
});

//@description     Remove a user (admin only)
//@route           DELETE /api/user/admin/:id
//@access          Admin
export const removeUserByAdmin = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.remove();
  res.json({ message: "User removed successfully" });
});

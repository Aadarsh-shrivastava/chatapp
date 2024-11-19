import jwt from "jsonwebtoken";
import User from "../models/user.js";
import asyncHandler from "express-async-handler";

const protectRoutesMiddleWare = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      let decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      console.log(req.user, decoded);
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("no token found");
  }
});

export default protectRoutesMiddleWare;

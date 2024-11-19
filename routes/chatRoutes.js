import express from "express";
import { accessChat } from "../controllers/chatController.js";
import protectRoutesMiddleWare from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoutesMiddleWare, accessChat);
export default router;

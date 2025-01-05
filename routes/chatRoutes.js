import express from "express";
import {
  accessChat,
  fetchAllChats,
  createGroupChats,
  RenameGroup,
  removeFromGroup,
  addUserToGroup,
} from "../controllers/chatController.js";
import protectRoutesMiddleWare from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protectRoutesMiddleWare, accessChat);
router.route("/").get(protectRoutesMiddleWare, fetchAllChats);
router.route("/group/").post(protectRoutesMiddleWare, createGroupChats);
router.route("/group/add").post(protectRoutesMiddleWare, addUserToGroup);
router.route("/group/rename").post(protectRoutesMiddleWare, RenameGroup);
router.route("/group/remove").post(protectRoutesMiddleWare, removeFromGroup);

export default router;

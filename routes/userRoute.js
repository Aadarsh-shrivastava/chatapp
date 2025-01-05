import express from "express";
import {
  allUsers,
  authUser,
  registerUser,
} from "../controllers/userController.js";
const router = express.Router();

router.route("/").get(allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

export default router;
  
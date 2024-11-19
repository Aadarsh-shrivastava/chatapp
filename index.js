import { Server } from "socket.io";
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import http from "http";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

import mongoConnect from "./config/mongo.js";
import Message from "./models/message.js";
import uploadImage from "./controllers/fileUpload.js";

import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
// console.log("socket port", process.env.SOCKET_PORT);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.removeHeader("x-powered-by");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile("/public/index.html");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

io.on("connection", (socket) => {
  socket.on("user-message", (message) => {
    io.emit("message", message);
  });
});
// app.post("/api/upload", upload.single("avatar"), uploadImage);

const initApp = async () => {
  try {
    await mongoConnect();
    console.log("DB connection established");
    server.listen(process.env.HTTP_PORT, () => {
      console.log(`HTTP Server listening on ${process.env.HTTP_PORT}`);
    });
  } catch (e) {
    throw e;
  }
};

initApp().catch((err) => console.log(`Error on startup! ${err}`));

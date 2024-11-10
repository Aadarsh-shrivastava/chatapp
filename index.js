import { Server } from "socket.io";
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";

import dotenv from "dotenv";
dotenv.config();

import mongoConnect from "./config/mongo.js";
import Message from "./models/message.js";
import uploadImage from "./controllers/fileUpload.js";

console.log("socket port", process.env.SOCKET_PORT);

const io = new Server(process.env.SOCKET_PORT, () => {
  console.log("socket server connected");
});
const app = express();

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

app.post("/api/upload", upload.single("avatar"), uploadImage);

const initApp = async () => {
  try {
    await mongoConnect();
    console.log("DB connection established");
    app.listen(process.env.HTTP_PORT, () => {
      console.log(`HTTP Server listening on ${process.env.HTTP_PORT}`);
    });
  } catch (e) { 
    throw e;
  }
};

initApp().catch((err) => console.log(`Error on startup! ${err}`));

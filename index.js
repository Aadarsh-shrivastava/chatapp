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
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
// console.log("socket port", process.env.SOCKET_PORT);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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
app.use("/api/message", messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    console.log("stting up", userData._id);
    socket.join(userData._id);
    console.log(
      "Emitting connected to server with rooms:",
      Array.from(socket.rooms)
    );
    socket.emit("connected to server", Array.from(socket.rooms));
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined a room", socket.rooms);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stoptyping");
  });

  // Get all rooms on the server
  const getAllRooms = () => {
    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    return rooms;
  };

  // Log all rooms
  console.log("All rooms:", getAllRooms());

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    console.log("chat", chat);
    if (!chat.users) return console.log("chat.users not defined");
    if (chat.users.length == 0) {
      console.log("no recipient");
    }

    chat.users.forEach((user) => {
      // if (user._id == newMessageRecieved.sender._id) return;
      console.log(newMessageRecieved, " sending to ", user);
      socket.in(user).emit("new message", newMessageRecieved);
    });
  });
});

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

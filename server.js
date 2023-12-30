const express = require("express");
const app = express();
const Users = require("./api/users");
const Rooms = require("./api/rooms");
const Invites = require("./api/invites");
const db = require("./db");
const cors = require("cors");

const { createServer } = require("http");
const socketio = require("socket.io");

//--------------Requirements-----------//
db.init();
const httpServer = createServer(app);

//-------------Middlewares-------------//
app.use(express.json({ limit: "10mb" }));
const corsOptions = { "Access-Control-Allow-Origin": "*" };
app.use(cors(corsOptions));

//-------------Socket-------------//
const io = socketio(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});

io.on("connection", (socket) => {
  // socket.on("joinRoom", (obj) => {
  //   console.log(obj);
  // });

  socket.emit("foo", "Hello World");
});

//-------------routes------------------//
app.use("/users", Users);
app.use("/rooms", Rooms);
app.use("/invites", Invites);

httpServer.listen(4000);

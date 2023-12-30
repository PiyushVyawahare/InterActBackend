const express = require("express");
const app = express();
const Users = require("./api/users");
const Rooms = require("./api/rooms");
const Invites = require("./api/invites");
const db = require("./db");
const cors = require("cors");

const { createServer } = require("http");
const socketio = require("socket.io");
const messages = require("./db/schema/messages");

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
  socket.on("joinRoom", (obj) => {
    socket.join(obj.room_id);
  });

  socket.on("sendMessage", async (obj) => {
    console.log(obj);
    await messages.create({
      message: obj.message,
      room_id: obj.room_id,
      created_at: new Date(),
    });
    io.to(obj.room_id).emit('newMessage', {
      message: obj.message
    });
  })
});

//-------------routes------------------//
app.use("/users", Users);
app.use("/rooms", Rooms);
app.use("/invites", Invites);

httpServer.listen(4000);

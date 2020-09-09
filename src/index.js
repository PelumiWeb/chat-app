const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utilis/messages");
const {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utilis/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectlyPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectlyPath));
const message = "Welcome to the group";

io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    const { error, user } = addUsers({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendInputMsg", (inputVal, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(inputVal)) {
      return callback("Profainity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, inputVal));
    callback("Delivered");
  });

  socket.on("SendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "LocationMessage",
      generateLocation(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback("Delivered");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("server is up on port " + port);
});

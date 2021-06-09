import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createAdapter } from "socket.io-redis";
import redis, { RedisClient } from "redis";
import { getMessagesForRoom, getUsersInRoom } from "./DynamoQueries";
import { saveRoomMessage, leaveRoom, joinRoom } from "./DynamoPuts";
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const dotenv = require("dotenv");

dotenv.config();
const env = process.env.ENV;
const app = express();
app.use(cors());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
app.use(bodyParser.urlencoded());
app.use(express.static("build"));

const server = createServer(app);
const port = process.env.PORT || 3001;
const io =
  env === "local"
    ? new Server(server, {
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
      })
    : new Server(server);

let pubClient: redis.RedisClient;
// Toggle Redis / Dynamo connection if you want to test locally
const localRedis = true;
const localDynamo = true;
if (env !== "local") {
  try {
    const redisEndpoint = process.env.REDIS_ENDPOINT;

    pubClient = new RedisClient({ host: redisEndpoint, port: 6379 });
    console.log(`Connecting to Redis client @ ${redisEndpoint}`);
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter({ pubClient, subClient }));
  } catch (err) {
    console.log("REDIS ERROR", err);
  }
} else if (localRedis) {
  pubClient = redis.createClient();

  pubClient.on("error", (err) => {
    console.log("Redis error: ", err);
  });
}

// Serve the react file build

app.get("/login/:err", (req, res) => {
  const errMessage = req.params.err;
  const userID = req.session.userID;
  const userId = req.cookies.userId;
  if (userId) {
    res.redirect("/");
  }

  res.render("/login");
});
app.post("/login", (req, res) => {
  const loginInfo = req.body;
  // const userInfo = dynamoDB.get(username)
  const userInfo = "9e0dsjkljas";

  bcrypt.compare(loginInfo.password, userInfo, (err, result) => {
    if (result) {
      res.cookie("userID", "test");
      return res.redirect("/app");
    }
    return res.redirect("/login/401");
  });
});
app.get("*", (req, res) => res.sendFile("index.html"));

server.listen(port, () => {
  console.log("Running server on port %s", port);
});

interface IRoomData {
  userId: string;
  roomId: string;
  username: string;
}

type IUserList = string[];

export interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}

io.on("connect", async (socket: Socket) => {
  console.log("Connected client on port %s", port);

  // Send connected client drawing information.
  // Can be whatever room we choose, i just hardcoded drawDataRoom1
  if (localRedis) {
    pubClient.lrange("drawDataRoom1", 0, -1, (err, reply) => {
      console.log("Sending new client list of draw items. Size:", reply.length);
      reply.forEach((drawData) => socket.emit("draw", JSON.parse(drawData)));
    });
  }

  // Get list of messages for room.
  if (localDynamo) {
    const roomMessageList = await getMessagesForRoom("Lobby");
    socket.emit("messageList", roomMessageList);
  }

  // Send list of active users to room
  const updateRoomList = async (roomId: string) => {
    const userList = await getUsersInRoom(roomId);
    io.in(roomId).emit("roomListUpdate", userList);
  };

  socket.on("message", async (m: ISocketMessage) => {
    // Send to all clients
    // io.emit("message", m);

    // Sent to room only
    io.to(m.room).emit("message", m);
    if (localDynamo) {
      saveRoomMessage(m);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("clearBoard", () => {
    // Clears the drawing data from REDIS and tells clients to do the same
    console.log("Clearing board...");
    if (localRedis) {
      pubClient.DEL("drawDataRoom1");
    }
    io.emit("clearBoard");
  });

  socket.on("draw", (data) => {
    // Send to all clients. Will replace with io.to('roomName')
    io.emit("draw", data);
    if (localRedis) {
      pubClient.lpush("drawDataRoom1", JSON.stringify(data));

      // Limit to....10,000 draw items? Don't want browser to crash on inital load.
      // Running into some crashing issues.
      pubClient.ltrim("drawDataRoom1", 0, 10000);
    }
  });

  socket.on("joinRoom", async (data: IRoomData) => {
    console.log("socket joining room ID", data.roomId);
    socket.join(data.roomId);
    if (localRedis) {
      pubClient.lpush(`${data.roomId}Users`, data.userId);
      // Emit new list of users to room so UI can update
      updateRoomList(data.roomId);
    }
    if (localDynamo) {
      joinRoom(data.roomId, data.userId, data.username, false);
      // Dynamo query room messages for newly connected user
      const roomMessageList = await getMessagesForRoom(data.roomId);

      socket.emit("messageList", roomMessageList);
    }
  });

  socket.on("leaveRoom", (data: IRoomData) => {
    socket.leave(data.roomId);
    if (localRedis) {
      pubClient.LREM(`${data.roomId}Users`, 1, data.userId);
    }
    if (localDynamo) {
      leaveRoom(data.roomId, data.userId);
      // Emit new list of users to room so UI can update
      updateRoomList(data.roomId);
    }
  });
});

export default app;

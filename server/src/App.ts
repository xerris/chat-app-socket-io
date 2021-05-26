import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createAdapter } from "socket.io-redis";
import redis, { RedisClient } from "redis";
import { getMessagesForRoom, getUsersInRoom } from "./DynamoQueries";
import { saveRoomMessage, leaveRoom, joinRoom } from "./DynamoPuts";

require("dotenv").config({ path: "./.env" });
const app = express();
app.use(cors());

const server = createServer(app);
const port = process.env.PORT || 3001;
const env = process.env.ENV;
const io =
  env === "dev"
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
// Toggle Redis if you want to test locally

const localRedis = false;
const localDynamo = false;
if (env === "prod") {
  const redisEndpoint = process.env.REDIS_ENDPOINT;

  pubClient = new RedisClient({ host: redisEndpoint, port: 6379 });
  console.log(`Connecting to Redis client @ ${redisEndpoint}`);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter({ pubClient, subClient }));
} else if (localRedis) {
  pubClient = redis.createClient();

  pubClient.on("error", (err) => {
    console.log("Redis error: ", err);
  });
}

// Serve the react file build
app.use(express.static("build"));
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

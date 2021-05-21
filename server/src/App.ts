import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createAdapter } from "socket.io-redis";
import redis, { RedisClient } from "redis";
import { getMessagesForRoom, saveRoomMessage } from "./Dynamo";

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

let localClient: redis.RedisClient;
// Toggle Redis if you want to test locally
const remoteRedis = false;
const localRedis = true;
if (remoteRedis) {
  const redisEndpoint =
    env === "dev"
      ? process.env.LOCAL_REDIS_ENDPOINT
      : process.env.REDIS_ENDPOINT;

  const pubClient = new RedisClient({ host: redisEndpoint, port: 6379 });
  console.log(`Connecting to Redis client @ ${redisEndpoint}`);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter({ pubClient, subClient }));
  // }
} else if (localRedis) {
  localClient = redis.createClient();

  localClient.on("error", (err) => {
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
  roomName: string;
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
  localClient.lrange("drawDataRoom1", 0, -1, (err, reply) => {
    console.log("Sending new client list of draw items. Size:", reply.length);
    reply.forEach((drawData) => socket.emit("draw", JSON.parse(drawData)));
  });

  // Get list of messages for room.
  const roomMessageList = await getMessagesForRoom("Lobby");
  socket.emit("messageList", roomMessageList);

  // Send list of active users to room
  const updateRoomList = async (roomName: string) => {
    localClient.lrange(`${roomName}Users`, 0, -1, (err, reply: IUserList) => {
      console.log(
        "🚀 ~ file: App.ts ~ line 91 ~ localClient.lrange ~ reply",
        reply
      );
      io.in(roomName).emit("roomListUpdate", reply);
    });
  };

  socket.on("message", async (m: ISocketMessage) => {
    // Send to all clients
    io.emit("message", m);

    // Sent to room only
    // io.to(m.room).emit("message", m);
    console.log("🚀 ~ Message received", m);

    await saveRoomMessage(m);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("clearBoard", () => {
    // Clears the drawing data from REDIS and tells clients to do the same
    console.log("Clearing board...");
    localClient.DEL("drawDataRoom1");
    io.emit("clearBoard");
  });

  socket.on("draw", (data) => {
    // Send to all clients. Will replace with io.to('roomName')
    io.emit("draw", data);
    localClient.lpush("drawDataRoom1", JSON.stringify(data));

    // Limit to....10,000 draw items? Don't want browser to crash on inital load.
    // Running into some crashing issues.
    localClient.ltrim("drawDataRoom1", 0, 10000);
  });

  socket.on("joinRoom", async (data: IRoomData) => {
    console.log("socket joining", data.roomName);
    socket.join(data.roomName);
    localClient.lpush(`${data.roomName}Users`, data.username);
    // Emit new list of users to room so UI can update
    updateRoomList(data.roomName);

    // Dynamo query room messages for newly connected user
    const roomMessageList = await getMessagesForRoom(data.roomName);

    socket.emit("messageList", roomMessageList);
  });

  socket.on("leaveRoom", (data: IRoomData) => {
    socket.leave(data.roomName);
    localClient.LREM(`${data.roomName}Users`, 1, data.username);
    // Emit new list of users to room so UI can update
    updateRoomList(data.roomName);
  });
});

export default app;

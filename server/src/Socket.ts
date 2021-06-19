import { Server, Socket } from "socket.io";
import { port } from "./App";
import { joinRoom, leaveRoom, saveRoomMessage } from "./DynamoPuts";
import { getMessagesForRoom, getUsersInRoom } from "./DynamoQueries";
import { createAdapter } from "socket.io-redis";
import redis, { RedisClient } from "redis";
import http = require("http");
import * as dotenv from "dotenv";
dotenv.config();

// Toggle Redis / Dynamo connection if you want to test these locally
// And have both services configured & running
export const localRedis = true;
export const localDynamo = true;
const env = process.env.ENV;
console.log("🚀 ~ file: Socket.ts ~ line 8 ~ env", env, localRedis);
export interface IRoomData {
  userId: string;
  roomId: string;
  username: string;
}

export type IUserList = string[];

export interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}
const generateSocketServer = (server: http.Server) => {
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
      : new Server(server, {
          cors: {
            // Would change origin to eventual DNS for react app if
            // uploaded to S3 instead of served.
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
          },
          maxHttpBufferSize: 1024, // max message payload size (prevents clients from sending gigabytes of data)
          pingInterval: 60 * 1000, // 1 minute
          pingTimeout: 4 * 60 * 1000
        });

  let pubClient: redis.RedisClient;

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
    console.log("creating REDIS CLIENT");
    pubClient = redis.createClient();

    pubClient.on("error", (err) => {
      console.log("Redis error: ", err);
    });
  }

  io.on("connect", async (socket: Socket) => {
    console.log("Connected client on port %s", port);

    // Send connected client drawing information.
    // Can be whatever room we choose, i just hardcoded drawDataRoom1
    if (localRedis) {
      pubClient.lrange("drawDataRoom1", 0, -1, (err, reply) => {
        console.log(
          "Sending new client list of draw items. Size:",
          reply.length
        );
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
};

export default generateSocketServer;

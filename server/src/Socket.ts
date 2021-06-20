import { Server, Socket } from "socket.io";
import { port } from "./App";
import { joinRoom, leaveRoom, saveRoomMessage } from "./DynamoPuts";
import { getMessagesForRoom, getUsersInRoom } from "./DynamoQueries";
import { createAdapter } from "socket.io-redis";
import redis, { RedisClient } from "redis";
import http = require("http");
import * as dotenv from "dotenv";
import { v4 } from "uuid";
import { RedisSessionStore } from "./sessionStore";
dotenv.config();

// Toggle Redis / Dynamo connection if you want to test these locally
// And have both services configured & running
export const localRedis = true;
export const localDynamo = true;
const env = process.env.ENV;
export interface IRoomData {
  userId: string;
  roomId: string;
  username: string;
}

interface ICustomSocket extends Socket {
  username?: string;
  sessionId?: string;
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

  let sessionStore: RedisSessionStore;
  let pubClient: redis.RedisClient;
  if (env !== "local") {
    try {
      const redisEndpoint = process.env.REDIS_ENDPOINT;

      pubClient = new RedisClient({ host: redisEndpoint, port: 6379 });
      console.log(`Connecting to Redis client @ ${redisEndpoint}`);
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter({ pubClient, subClient }));
      sessionStore = new RedisSessionStore(pubClient);
    } catch (err) {
      console.log("REDIS ERROR", err);
    }
  } else if (localRedis) {
    pubClient = redis.createClient();
    sessionStore = new RedisSessionStore(pubClient);
    pubClient.on("error", (err) => {
      console.log("Redis error: ", err);
    });
  }

  // Middleware to only allow connection with username.
  // Could use a JWT token in here to secure connection further.
  io.use(async (socket: ICustomSocket, next) => {
    const sessionId = socket.handshake.auth.sessionId;

    if (sessionId) {
      const session = await sessionStore.findSession(sessionId);
      if (session) {
        socket.sessionId = sessionId;
        socket.username = session.username;
        return next();
      }
    }
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }

    socket.sessionId = v4();
    socket.username = username;

    next();
  });

  io.on("connect", async (socket: ICustomSocket) => {
    // const updateOnlineUsers = () => {
    //   pubClient.lrange(`onlineUsers`, 0, -1, (err, roomList: IUserList) => {
    //     io.emit("onlineUserUpdate", roomList);
    //   });
    // };

    // // Send list of active users to room
    // const updateRoomList = async (roomId: string) => {
    //   const userList = await getUsersInRoom(roomId);
    //   io.in(roomId).emit("roomListUpdate", userList);
    // };

    console.log(
      `${socket.username} connected on port %s`,
      port,
      `with session id ${socket.sessionId}`
    );
    if (localRedis && socket.username && socket.sessionId) {
      // Emit initial session details
      sessionStore.saveSession(socket.sessionId, {
        username: socket.username,
        connected: `true`
      });
      socket.emit("session", {
        sessionId: socket.sessionId
      });
      // Put into online user list
      pubClient.lpush(`onlineUsers`, socket.username);
      updateOnlineUsers();
      // Send connected client drawing information.
      // Can be whatever room we choose, i just hardcoded drawDataRoom1
      setTimeout(
        () =>
          pubClient.lrange("drawDataRoom1", 0, -1, (err, reply) => {
            console.log(
              "Sending new client list of draw items. Size:",
              reply.length
            );
            reply.forEach((drawData) =>
              socket.emit("draw", JSON.parse(drawData))
            );
          }),
        300
      );
    }

    // Get list of messages for room.
    if (localDynamo) {
      const roomMessageList = await getMessagesForRoom("Lobby");
      socket.emit("messageList", roomMessageList);
    }

    socket.on("message", async (m: ISocketMessage) => {
      // Sent to room only
      io.to(m.room).emit("message", m);
      if (localDynamo) {
        saveRoomMessage(m);
      }
    });

    socket.on("disconnect", () => {
      if (socket.username && socket.sessionId) {
        console.log(`${socket.username} disconnected`);
        sessionStore.saveSession(socket.sessionId, {
          username: socket.username,
          connected: `false`
        });
        pubClient.LREM(`onlineUsers`, 1, socket.username);
        updateOnlineUsers();
      }
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

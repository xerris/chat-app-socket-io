import SocketIO = require("socket.io");
import { Server, Socket } from "socket.io";
import { port } from "./App";
import { joinRoom, leaveRoom, saveRoomMessage } from "./DynamoPuts";
import {
  getMessagesForRoom,
  getRoomList,
  getUsersInRoom
} from "./DynamoQueries";
import { createAdapter } from "socket.io-redis";
import redis, { RedisClient } from "redis";
import http = require("http");
import * as dotenv from "dotenv";
import { v4 } from "uuid";
import { RedisSessionStore } from "./sessionStore";

export interface IServerConfig {
  environment: "local" | "prod";
  configuredLocalRedis: boolean;
  configuredDynamo: boolean;
  remoteRedisEndpoint?: string;
}

interface ICustomSocket extends Socket {
  username?: string;
  sessionId?: string;
}

export interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface IRoomData {
  userId: string;
  roomId: string;
  username: string;
}

class SocketManager {
  io: SocketIO.Server;
  pubClient: redis.RedisClient;
  sessionStore: RedisSessionStore;
  serverConfig: IServerConfig;
  redisEnabled: boolean;
  dynamoEnabled: boolean;
  constructor(server: http.Server, config: IServerConfig) {
    this.serverConfig = config;
    console.log(
      "🚀 ~ file: SocketManager.ts ~ line 51 ~ SocketManager ~ constructor ~  this.serverConfig",
      this.serverConfig
    );
    this.dynamoEnabled = config.configuredDynamo;
    this.generateSocketServer(server);

    // Setup redis connection
    if (this.serverConfig.configuredLocalRedis) {
      this.connectToLocalRedis();
      this.redisEnabled = true;
    } else if (this.serverConfig.remoteRedisEndpoint) {
      this.connectToHostedRedis(this.serverConfig.remoteRedisEndpoint);
      this.redisEnabled = true;
    }

    this.configureMiddleware();
    this.registerSocketListeners();
  }

  generateSocketServer = (server: http.Server) => {
    this.io = new Server(server, {
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
  };

  connectToLocalRedis = () => {
    this.pubClient = redis.createClient();
    this.sessionStore = new RedisSessionStore(this.pubClient);
    this.pubClient.on("error", (err) => {
      console.log("Redis error: ", err);
    });
  };

  connectToHostedRedis = (redisEndpoint: string) => {
    this.pubClient = new RedisClient({ host: redisEndpoint, port: 6379 });
    const subClient = this.pubClient.duplicate();
    this.io.adapter(createAdapter({ pubClient: this.pubClient, subClient }));
    this.sessionStore = new RedisSessionStore(this.pubClient);
  };

  configureMiddleware = () => {
    // Middleware to only allow connection with username, and
    // store session if redis is enabled. Could use a JWT token
    // in here to secure connection further.
    this.io.use(async (socket: ICustomSocket, next) => {
      const sessionId = socket.handshake.auth.sessionId;
      console.log(
        "🚀 ~ file: SocketManager.ts ~ line 108 ~ SocketManager ~ this.io.use ~ sessionId",
        sessionId
      );

      if (sessionId && this.redisEnabled) {
        const session = await this.sessionStore.findSession(sessionId);
        console.log(
          "🚀 ~ file: SocketManager.ts ~ line 111 ~ SocketManager ~ this.io.use ~ session",
          session
        );
        if (session) {
          socket.sessionId = sessionId;
          socket.username = session.username;
          console.log(
            "🚀 ~ file: SocketManager.ts ~ line 122 ~ SocketManager ~ this.io.use ~ username",
            session.username
          );
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
  };

  updateOnlineUsers = () => {
    this.pubClient.lrange(`onlineUsers`, 0, -1, (err, userList: string[]) => {
      let uniqueUserList = [...new Set(userList)];
      this.io.emit("onlineUserUpdate", uniqueUserList);
    });
  };

  sendRoomList = async (socket: Socket) => {
    const roomList = await getRoomList();
    socket.emit("roomListUpdate", roomList);
  };

  updateUsersInRoom = async (roomId: string) => {
    // TODO: Configure on front-end
    const userList = await getUsersInRoom(roomId);
    this.io.in(roomId).emit("usersInRoom", userList);
  };

  registerSocketListeners = () => {
    this.io.on("connect", async (socket: ICustomSocket) => {
      if (this.redisEnabled && socket.username && socket.sessionId) {
        this.sessionStore.saveSession(socket.sessionId, {
          username: socket.username,
          connected: `true`
        });
        socket.emit("session", {
          sessionId: socket.sessionId,
          username: socket.username
        });
        // Put into online user list
        this.pubClient.lpush(`onlineUsers`, socket.username);
        this.updateOnlineUsers();
      }
      this.sendRoomList(socket);
      this.sendRoomDrawingsOnLoad(socket);

      socket.on("message", async (m: ISocketMessage) => {
        // Sent to room only
        this.io.to(m.room).emit("message", m);
        if (this.dynamoEnabled) {
          saveRoomMessage(m);
        }
      });

      socket.on("disconnect", () => {
        if (socket.username && socket.sessionId) {
          console.log(`${socket.username} disconnected`);
          if (this.redisEnabled) {
            this.sessionStore.saveSession(socket.sessionId, {
              username: socket.username,
              connected: `false`
            });
            this.pubClient.LREM(`onlineUsers`, 1, socket.username);
          }
          this.updateOnlineUsers();
        }
      });

      socket.on("clearBoard", () => {
        // Clears the drawing data from REDIS and tells clients to do the same
        console.log("Clearing board...");
        if (this.redisEnabled) {
          this.pubClient.DEL("drawDataRoom1");
        }
        this.io.emit("clearBoard");
      });

      socket.on("draw", (data) => {
        // Send to all clients. Will replace with io.to('roomName')
        this.io.emit("draw", data);
        if (this.redisEnabled) {
          this.pubClient.lpush("drawDataRoom1", JSON.stringify(data));
          // Limit to....10,000 draw items
          this.pubClient.ltrim("drawDataRoom1", 0, 10000);
        }
      });

      socket.on("joinRoom", async (data: IRoomData) => {
        console.log(`${socket.username} joining room ID ${data.roomId}`);
        socket.join(data.roomId);

        if (this.dynamoEnabled && socket.username) {
          joinRoom(data.roomId, data.userId, socket.username, false);
          // Dynamo query room messages for newly connected user
          const roomMessageList = await getMessagesForRoom(data.roomId);
          console.log(
            "🚀 ~ file: SocketManager.ts ~ line 224 ~ SocketManager ~ socket.on ~ roomMessageList",
            roomMessageList
          );
          socket.emit("messageList", roomMessageList);
          this.updateUsersInRoom(data.roomId);
        }
      });

      socket.on("leaveRoom", (data: IRoomData) => {
        socket.leave(data.roomId);

        if (this.dynamoEnabled) {
          leaveRoom(data.roomId, data.userId);
          // Emit new list of users to room so UI can update
          this.updateUsersInRoom(data.roomId);
        }
      });
    });
  };

  sendRoomDrawingsOnLoad = (socket: Socket) => {
    setTimeout(
      () =>
        this.pubClient.lrange("drawDataRoom1", 0, -1, (err, reply) => {
          console.log(
            "Sending new client list of draw items. Size:",
            reply.length
          );
          reply.forEach((drawData) =>
            socket.emit("draw", JSON.parse(drawData))
          );
        }),
      100
    );
  };
}

export { SocketManager };

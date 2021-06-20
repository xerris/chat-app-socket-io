import SocketIO = require("socket.io");
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
    this.dynamoEnabled = config.configuredDynamo;
    this.generateSocketServer(server);

    // Setup redis connection
    if (
      this.serverConfig.environment === "local" &&
      this.serverConfig.configuredLocalRedis
    ) {
      this.connectToLocalRedis();
      this.redisEnabled = true;
    } else if (
      this.serverConfig.environment === "prod" &&
      this.serverConfig.remoteRedisEndpoint
    ) {
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
    this.io.adapter(
      createAdapter(createAdapter({ pubClient: this.pubClient, subClient }))
    );
    this.sessionStore = new RedisSessionStore(this.pubClient);
  };

  configureMiddleware = () => {
    // Middleware to only allow connection with username, and
    // store session if redis is enabled. Could use a JWT token
    // in here to secure connection further.
    this.io.use(async (socket: ICustomSocket, next) => {
      const sessionId = socket.handshake.auth.sessionId;

      if (sessionId && this.redisEnabled) {
        const session = await this.sessionStore.findSession(sessionId);
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
  };

  updateOnlineUsers = () => {
    this.pubClient.lrange(`onlineUsers`, 0, -1, (err, roomList: string[]) => {
      this.io.emit("onlineUserUpdate", roomList);
    });
  };

  updateUsersInRoom = async (roomId: string) => {
    const userList = await getUsersInRoom(roomId);
    this.io.in(roomId).emit("roomListUpdate", userList);
  };

  registerSocketListeners = () => {
    this.io.on("connect", async (socket: ICustomSocket) => {
      if (this.redisEnabled && socket.username && socket.sessionId) {
        this.sessionStore.saveSession(socket.sessionId, {
          username: socket.username,
          connected: `true`
        });
        socket.emit("session", {
          sessionId: socket.sessionId
        });
        // Put into online user list
        this.pubClient.lpush(`onlineUsers`, socket.username);
        this.updateOnlineUsers();
      }
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
          this.sessionStore.saveSession(socket.sessionId, {
            username: socket.username,
            connected: `false`
          });
          this.pubClient.LREM(`onlineUsers`, 1, socket.username);
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
        console.log("socket joining room ID", data.roomId);
        socket.join(data.roomId);

        if (this.dynamoEnabled) {
          joinRoom(data.roomId, data.userId, data.username, false);
          // Dynamo query room messages for newly connected user
          const roomMessageList = await getMessagesForRoom(data.roomId);
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
      300
    );
  };
}

export { SocketManager };

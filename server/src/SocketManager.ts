import SocketIO = require("socket.io");
import { Server, Socket } from "socket.io";
import {
  createPrivateMessage,
  deleteRoomMessage,
  joinRoom,
  leaveRoom,
  saveRoomMessage
} from "./DynamoPuts";
import {
  getAllUsers,
  getMessagesForRoom,
  getPrivateMessagesForRoom,
  getPrivateMessagesForUser,
  getRoomList,
  getRoomlistForUser,
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
  privateMessage?: boolean;
}

export interface IRoomData {
  userId: string;
  roomId: string;
  username: string;
}

// Contains setup for socket server/listeners and redis connection
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
    if (this.serverConfig.configuredLocalRedis) {
      this.connectToLocalRedis();
      this.redisEnabled = true;
    } else if (this.serverConfig.remoteRedisEndpoint) {
      this.connectToHostedRedis(this.serverConfig.remoteRedisEndpoint);
      this.redisEnabled = true;
    }

    this.configureMiddleware();
    this.registerSocketListeners();
    this.updateOnlineUsers();
  }

  generateSocketServer = (server: http.Server) => {
    // Socket server property
    this.io = new Server(server, {
      cors: {
        // Would change origin to eventual DNS for react app if
        // uploaded to S3 instead of served.
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      allowEIO3: true, // Whether to enable compatibility with Socket.IO v2 clients.
      maxHttpBufferSize: 1024, // max message payload size (prevents clients from sending gigabytes of data)
      pingInterval: 45 * 1000, // 45 seconds (less than ALB timeout)
      pingTimeout: 4 * 60 * 1000 // 4 minutes
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

  updateOnlineUsers = async () => {
    const onlineUserArray = await this.sessionStore.getOnlineUsers();
    this.io.emit("onlineUserUpdate", onlineUserArray);

    const userArray = await getAllUsers();
    const usernameArray = userArray.map((user: IRoomData) => user.username);
    this.io.emit("allUserUpdate", usernameArray);
  };

  sendRoomList = async (socket: Socket) => {
    const roomList = await getRoomList();
    socket.emit("roomListUpdate", roomList);
  };

  sendUserRoomList = async (socket: ICustomSocket) => {
    if (socket.username) {
      const userRoomList = await getRoomlistForUser(socket.username);

      if (userRoomList) {
        userRoomList.forEach(async (room) => {
          socket.join(room.roomId);
          const messages = await getMessagesForRoom(room.roomId);
          socket.emit("messageList", messages);
        });
      }
      const userPrivateMessageList = await getPrivateMessagesForUser(
        socket.username
      );

      if (userPrivateMessageList) {
        userPrivateMessageList.forEach(async (room, index) => {
          socket.join(room.roomId);
          const messages = await getPrivateMessagesForRoom(room.roomId);

          socket.emit("privateMessageList", {
            ...messages,
            receiver: room.receiver
          });
        });
      }
    }
  };

  updateUsersInRoom = async (roomId: string) => {
    const userList = await getUsersInRoom(roomId);
    this.io.in(roomId).emit("usersInRoom", { users: userList, roomId });
  };

  sendRoomDrawingsOnLoad = (socket: Socket) => {
    setTimeout(
      () =>
        this.pubClient.lrange("drawDataRoom1", 0, -1, (err, reply) => {
          reply.forEach((drawData) =>
            socket.emit("draw", JSON.parse(drawData))
          );
        }),
      100
    );
  };

  registerSocketListeners = () => {
    // When the socket initially connects
    this.io.on("connect", async (socket: ICustomSocket) => {
      // Join user channel, so we can send messages directly to this user.
      socket.join(`user${socket.username}`);
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
      // Send list of all rooms
      this.sendRoomList(socket);
      // Send list of rooms user has 'joined', including PM's
      this.sendUserRoomList(socket);
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

      socket.on("draw", (data) => {
        // Send to all clients. Will replace with io.to('roomName')
        this.io.emit("draw", data);
        if (this.redisEnabled) {
          this.pubClient.lpush("drawDataRoom1", JSON.stringify(data));
          // Limit to....10,000 draw items
          this.pubClient.ltrim("drawDataRoom1", 0, 10000);
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

      socket.on("joinRoom", async (data: IRoomData) => {
        console.log(`${socket.username} joining room ID ${data.roomId}`);
        socket.join(data.roomId);

        if (this.dynamoEnabled && socket.username) {
          joinRoom(data.roomId, data.userId, socket.username, false);
          // Dynamo query room messages for newly connected user
          const roomMessageList = await getMessagesForRoom(data.roomId);
          socket.emit("messageList", roomMessageList);
          this.updateUsersInRoom(data.roomId);
        }
      });

      socket.on("deleteMessage", async (data: any) => {
        if (this.dynamoEnabled && socket.username) {
          deleteRoomMessage({
            room: data.room,
            username: socket.username,
            timestamp: data.timestamp
          });

          // Dynamo query room messages for newly connected user
          const roomMessageList = await getMessagesForRoom(data.roomId);
          socket.emit("messageList", roomMessageList);
          socket.to(data.roomId).emit("messageList", roomMessageList);
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
      socket.on(
        "createPrivateMessage",
        async (data: { senderUsername: string; receiverUsername: string }) => {
          if (this.dynamoEnabled) {
            const roomId = await createPrivateMessage(
              data.senderUsername,
              data.receiverUsername
            );

            socket.join(roomId);

            this.io.to(`user${socket.username}`).emit("privateMessageList", {
              roomId,
              messages: [],
              receiver: data.receiverUsername,
              joinRoom: true
            });

            this.io
              .to(`user${data.receiverUsername}`)
              .emit("privateMessageList", {
                roomId,
                messages: [],
                receiver: data.senderUsername
              });

            // Let the other socket know about the room creation so it can join live
            socket
              .to(`user${data.senderUsername}`)
              .emit("privateMessageCreation", roomId);

            socket
              .to(`user${data.receiverUsername}`)
              .emit("privateMessageCreation", roomId);
          }
        }
      );
      socket.on("joinPrivateMessage", (roomId: string) => {
        socket.join(roomId);
      });
    });
  };
}

export { SocketManager };

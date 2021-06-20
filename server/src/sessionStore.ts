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

const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([username, connected]: string[]) => {
  return {
    username,
    connected
  };
};

class RedisSessionStore {
  redisClient: RedisClient;
  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  findSession(id: String): Promise<any> {
    return new Promise((resolve, reject) =>
      this.redisClient.hmget(
        `session:${id}`,
        "username",
        "connected",
        (err: Error | null, valueArray: string[] | null) => {
          console.log("vals from findSession", valueArray);
          if (valueArray) {
            return resolve(mapSession(valueArray));
          }
          if (err) {
            reject(err);
          }
          reject();
        }
      )
    );
  }

  saveSession(id: string, { username, connected }: { [key: string]: string }) {
    this.redisClient
      .multi()
      .hset(`session:${id}`, "username", username, "connected", connected)
      .expire(`session:${id}`, SESSION_TTL)
      .exec();
  }
}

export { RedisSessionStore };

class SocketManager {
  io: SocketIO.Server;
  pubClient: redis.RedisClient;
  sessionStore: RedisSessionStore;
  constructor(server: http.Server) {
    this.generateSocketServer(server);
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

  connectToRedis = (env: string) => {
    
  };
}

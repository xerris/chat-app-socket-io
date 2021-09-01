const { createServer } = require("http");
import SocketIO = require("socket.io");
import request from "supertest";
import { Server, Socket } from "socket.io";
const Client = require("socket.io-client");
import app from "../src/App";

import { describe, beforeEach, afterEach, expect } from "@jest/globals";
import { IServerConfig, SocketManager } from "./SocketManager";

const config: IServerConfig = {
  configuredDynamo: false,
  configuredLocalRedis: true,
  remoteRedisEndpoint: process.env.REDIS_ENDPOINT,
  environment: "local"
};
interface ISocket extends Socket {
  close?: () => void;
}

describe("my awesome project", () => {
  let io: SocketIO.Server;
  let serverSocket: ISocket;
  let clientSocket: ISocket;
  let socketManager: SocketManager;

  beforeEach((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    // socketManager = new SocketManager(httpServer, config);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket: ISocket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterEach(() => {
    io.close();
    if (clientSocket.close) clientSocket.close();
  });

  test("should work", (done: any) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work (with ack)", (done: any) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg: string) => {
      expect(arg).toBe("hola");
      done();
    });
  });

  describe("Test the root path", () => {
    test("It should response the GET method", (done) => {
      request(app)
        .get("/")
        .then((response: any) => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
  });

  describe("POST /api/login", () => {
    test("It responds with 500", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "test", password: "test" })
        .set("Accept", "application/json")
        .expect("Content-Type", "text/plain; charset=utf-8")
        .expect(500)
        .end(function (err, res) {
          if (err) return done(err);
          return done();
        });
    });
  });
  
  describe("POST /api/signup", () => {
    test("It responds with 500", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "test", password: "test", email: "test@test.com" })
        .set("Accept", "application/json")
        .expect("Content-Type", "text/plain; charset=utf-8")
        .expect(500)
        .end(function (err, res) {
          if (err) return done(err);
          return done();
        });
    });
  });
});

import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createAdapter } from "socket.io-redis";
import { RedisClient } from "redis";

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

// Toggle Redis if you want to test locally
const redis = true;
if (redis) {
  const pubClient = new RedisClient({
    host: process.env.REDIS_ENDPOINT,
    port: 6379
  });
  console.log(`Connecting to Redis client @ ${process.env.REDIS_ENDPOINT}`);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter({ pubClient, subClient }));
}

// Serve the react file build
app.use(express.static("build"));
app.get("*", (req, res) => res.sendFile("index.html"));

server.listen(port, () => {
  console.log("Running server on port %s", port);
});

io.on("connect", (socket: Socket) => {
  console.log("Connected client on port %s", port);

  socket.on("message", (m: any) => {
    console.log("got it");
    io.emit("message", m);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("draw", (data) => {
    io.emit("draw", data);
  });
});

export default app;

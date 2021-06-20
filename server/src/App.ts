import { createServer } from "http";
import express from "express";
import cors from "cors";
import routes from "./Routes";
import * as dotenv from "dotenv";
import { IServerConfig, SocketManager } from "./SocketManager";
const cookieSession = require("cookie-session");
const morgan = require("morgan");
dotenv.config();

// Express server config
const app = express();
app.use(
  cors({
    origin: true,
    methods: "POST",
    allowedHeaders: ["Content-Type", "my-custom-header"],
    credentials: true
  })
);
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("build"));
app.use(morgan("dev"));
app.use("/api", routes);

const server = createServer(app);
export const port = process.env.PORT || 3001;
// Set up Socket.IO server and redis client
const config: IServerConfig = {
  configuredDynamo: true,
  configuredLocalRedis: true && process.env.ENV === "local",
  remoteRedisEndpoint: process.env.REDIS_ENDPOINT,
  environment: process.env.ENV === "local" ? "local" : "prod"
};

new SocketManager(server, config);

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

server.listen(port, () => {
  console.log("Running server on port %s", port);
});

export default app;

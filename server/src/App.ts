import { createServer } from "http"
import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";

const app = express();
app.use(cors());

const server = createServer(app);
const port = process.env.PORT || 3001;
const io = new Server(server);

app.get('/', (req, res) => res.send("Hello!"));

server.listen(port, () => {
    console.log("Running server on port %s", port);
});

io.on("connect", (socket: Socket) => {
    console.log("Connected client on port %s", port);

    socket.on("message", (m: any) => {
        io.emit("message", m);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
})

export default app;
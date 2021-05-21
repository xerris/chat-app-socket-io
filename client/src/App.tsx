import React, { useState, useEffect, useContext } from "react";
import { Socket } from "socket.io-client";
import "./App.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import SketchPad from "./components/SketchPad";
import { SocketContext } from "./components/SocketContext";

interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("rexx92");
  const [roomName, setRoomName] = useState("Lobby");
  const [color, setColor] = useState("#1362b0");

  const socket: Socket = useContext(SocketContext);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("message", (data: ISocketMessage) => {
        console.log("message received for room", data);
        setLastMessage(data.message);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("message");
      }
    };
  });

  const sendMessage = () => {
    socket.emit("message", {
      room: roomName,
      username,
      message,
      timestamp: Date.now()
    });
  };

  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <SketchPad color={color} />
        <p>Connected: {"" + isConnected}</p>
        <p>Last message: {lastMessage || " -"}</p>
        <input value={message} onChange={onMessageChange} />
        <button onClick={sendMessage}>Send</button>
        <ColorPicker color={color} setColor={setColor} />
      </header>
    </div>
  );
}

export default App;

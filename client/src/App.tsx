import React, { useState, useEffect, useContext } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import "./App.css";
import SketchPad from "./components/SketchPad";
import { SocketContext } from "./components/SocketContext";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socket = useContext(SocketContext);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (socket && socket?.on && socket?.off) {
      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("message", (data) => {
        setLastMessage(data);
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
    socket.emit("message", message);
  };

  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <SketchPad />
        <p>Connected: {"" + isConnected}</p>
        <p>Last message: {lastMessage || " -"}</p>
        <input value={message} onChange={onMessageChange} />
        <button onClick={sendMessage}>Send</button>
      </header>
    </div>
  );
}

export default App;

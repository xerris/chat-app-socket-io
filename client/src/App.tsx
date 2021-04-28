import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("localhost:3001", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
});

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("message", (data) => {
      setLastMessage(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  });

  const sendMessage = () => {
    socket.emit("message", message);
  };

  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Connected: {"" + isConnected}</p>
        <p>Last message: {lastMessage || " -"}</p>
        <input value={message} onChange={onMessageChange}/>
        <button onClick={sendMessage}>Send</button>
      </header>
    </div>
  );
}

export default App;

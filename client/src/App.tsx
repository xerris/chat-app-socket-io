import React, { useState, useEffect, useContext } from "react";
import { Socket } from "socket.io-client";
import "./App.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import SketchPad from "./components/SketchPad";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { ISocketContext, SocketContext } from "./components/SocketContext";

interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}

interface IRoom {
  id: string;
  name: string;
}

export interface DynamoMessageQuery {
  SK: string;
  PK: string;
  message: string;
  username: string;
  timestamp: number;
}
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("rexx92");
  const [roomName, setRoomName] = useState("Lobby");
  const [chatData, setChatData] = useState([
    {
      SK: "#MESSAGE#rexx921621570384619",
      message: "Test hello dynamoooo",
      username: "rexx92",
      PK: "ROOM#Lobby",
      timestamp: 1621570384618
    },
    {
      SK: "#MESSAGE#rexx921621571157926",
      message: "Hi Tobi",
      username: "rexx92",
      PK: "ROOM#Lobby",
      timestamp: 1621571157923
    }
  ]);
  const [roomList, setRoomList] = useState<IRoom[]>([
    { name: "Lobby", id: "abcdef" }
  ]);
  const [roomUserList, setRoomUserList] = useState<string[]>([
    "rexx92, tobi22"
  ]);
  const [color, setColor] = useState("#1362b0");

  const socket: ISocketContext = useContext(SocketContext);

  const [message, setMessage] = useState("");

  useEffect(() => {
    // Connect to socket on refresh
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      socket.connectSocket(undefined, sessionId);
    }
  }, []);

  useEffect(() => {
    // Set up socket message handlers
    if (socket?.connection) {
      setIsConnected(true);

      socket.connection.on("session", ({ sessionId }) => {
        // Store session in localStorage
        socket.connection.auth = { sessionId };
        localStorage.setItem("sessionId", sessionId);
      });
      socket.connection.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.connection.on("message", (data: ISocketMessage) => {
        setLastMessage(data.message);
      });

      socket.connection.on("onlineUserUpdate", (data: string[]) => {
        console.log("online user update", data);
      });

      socket.connection.on("messageList", (data: DynamoMessageQuery[]) => {
        console.log("🚀 ~ messageList", data);
        setChatData(data);
      });
      socket.connection.on("roomListUpdate", (data: string[]) => {
        console.log("🚀 ~ roomListUpdate", data);
        setRoomUserList(data);
      });
    }

    return () => {
      if (socket?.connection) {
        socket.connection.off("connect");
        socket.connection.off("disconnect");
        socket.connection.off("session");
        socket.connection.off("onlineUserUpdate");
        socket.connection.off("messageList");
        socket.connection.off("roomListUpdate");
        socket.connection.off("message");
      }
      setIsConnected(false);
    };
  }, [socket, socket?.connection]);

  const sendMessage = () => {
    socket.connection.emit("message", {
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
        <p>Connected: {"" + isConnected}</p>
        {!isConnected && (
          <>
            <SignUp />
            <Login />
          </>
        )}
        {isConnected && (
          <>
            <SketchPad color={color} />
            <p>Last message: {lastMessage || " -"}</p>
            <input value={message} onChange={onMessageChange} />
            <button onClick={sendMessage}>Send</button>
            <ColorPicker color={color} setColor={setColor} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;

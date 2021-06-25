import React, { useState, useEffect, useContext } from "react";
import "./App.css";
import "./utilities/theme.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import SketchPad from "./components/SketchPad";
import RoomList from "./components/RoomList";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { ISocketContext, SocketContext } from "./components/SocketContext";
import Messages from "./components/Messages";
import UserList from "./components/UserList";

export interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface IRoomUserList {
  PK: string;
  SK: string;
  roomId: string;
  roomName: string;
  username: string;
}
export interface IRoom {
  roomId: string;
  roomName: string;
  message?: boolean;
  receiver?: string;
}
export interface IMessage {
  SK: string;
  PK: string;
  message: string;
  username: string;
  timestamp: number;
}
export interface IMessageList {
  roomId: string;
  messages: IMessage[];
}
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("undefined...");
  const [selectedRoomId, setSelectedRoomId] = useState("Lobby");
  const [chatData, setChatData] = useState([]);
  const [roomList, setRoomList] = useState<IRoom[]>([]);
  const [privateMessageList, setPrivateMessageList] = useState<IRoom[]>([]);
  const [usersInRoom, setUsersInRoom] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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

      socket.connection.on("session", ({ sessionId, username }) => {
        // Store session in localStorage
        onLogin(username);
        socket.connection.auth = { sessionId };
        localStorage.setItem("sessionId", sessionId);
      });
      socket.connection.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.connection.on("message", (data: IMessage) => {
        setChatData((prev) => {
          const chatDataCopy = prev.slice();
          chatDataCopy.push(data);
          return chatDataCopy;
        });
      });

      socket.connection.on(
        "onlineUserUpdate",
        (data: { username: string; connected: boolean }[]) => {
          setOnlineUsers(data.map((user) => user.username));
          console.log("online user update", data);
        }
      );

      socket.connection.on("messageList", (data: IMessageList) => {
        console.log("🚀 ~ messageList", data);
        setChatData(data.messages);
      });
      socket.connection.on("roomListUpdate", (data: IRoom[]) => {
        console.log("🚀 ~ all public room list", data);

        setRoomList(data);
      });
      socket.connection.on("userRoomListUpdate", (data: IRoom[]) => {
        const filteredPrivateMessages = data.filter((room) => !!room.message);
        console.log(
          "🚀 ~ Private messages a user is a part of",
          filteredPrivateMessages
        );
        setPrivateMessageList(filteredPrivateMessages);
      });
      socket.connection.on("usersInRoom", (data: IRoomUserList[]) => {
        setUsersInRoom(data.map((roomUser) => roomUser.username));
        console.log("🚀 ~ Update list of users for current room", data);
      });
    }

    return () => {
      if (socket?.connection) {
        socket.connection.offAny();
      }
      setIsConnected(false);
    };
  }, [socket, socket?.connection]);

  const sendMessage = () => {
    socket.connection.emit("message", {
      room: selectedRoomId,
      username,
      message,
      timestamp: Date.now()
    });
  };

  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleRoomChange = (roomId: string) => {
    console.log(
      "🚀 ~ file: App.tsx ~ line 138 ~ handleRoomChange ~ roomId",
      roomId
    );
    setSelectedRoomId(roomId);
    setChatData([]);
    socket.connection.emit("joinRoom", { roomId });
  };

  const onLogin = (username: string) => setUsername(username);

  const logout = () => {
    localStorage.clear();
    socket.disconnectSocket();
  };

  const createPrivateMessage = (receiverUsername: string) => {
    if (receiverUsername !== username) {
      socket.connection?.emit("createPrivateMessage", {
        senderUsername: username,
        receiverUsername
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Connected: {"" + isConnected}</p>
        {!isConnected && (
          <>
            <SignUp />
            <Login onLogin={onLogin} />
          </>
        )}
        {isConnected && (
          <>
            <UserList
              onlineUsers={onlineUsers}
              usersInRoom={usersInRoom}
              createPrivateMessage={createPrivateMessage}
            />
            <RoomList
              roomList={roomList}
              privateMessageList={privateMessageList}
              onChangeRoom={handleRoomChange}
              selectedRoom={selectedRoomId}
            />
            <Messages messages={chatData} username={username} />
            <input value={message} onChange={onMessageChange} />
            <button onClick={sendMessage}>Send</button>
            <button onClick={logout}>Logout</button>
            <SketchPad color={color} />
            <ColorPicker color={color} setColor={setColor} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;

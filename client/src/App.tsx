import React, { useState, useEffect, useContext } from "react";
import "./App.css";
import "./utilities/theme.css";
import RoomList from "./components/RoomList";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { AppContext } from "./components/AppContext";
import Messages from "./components/Messages";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const { socket, connectSocket, disconnectSocket, dispatch } =
    useContext(AppContext);

  useEffect(() => {
    // Connect to socket on refresh
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      connectSocket(undefined, sessionId);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [socket]);

  return (
    <div className="App">
      <header className="App-header">
        {!isConnected && (
          <>
            <SignUp />
            <Login />
          </>
        )}
        {isConnected && (
          <>
            <RoomList />
            <Messages />
          </>
        )}
      </header>
    </div>
  );
}

export default App;

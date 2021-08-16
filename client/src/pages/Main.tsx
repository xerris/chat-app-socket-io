import React, { useState, useEffect, useContext } from "react";
import Welcome from "./Welcome";
import Chat from "./Chat";
import "./../css/main.css";

import { AppContext } from "../components/AppContext";

interface Props {}

const Main = (props: Props) => {
  const [isConnected, setIsConnected] = useState(false);

  const { socket, connectSocket } = useContext(AppContext);

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
      <header>
        {!isConnected && (
          <>
            <Welcome />
          </>
        )}
        {isConnected && (
          <>
            <Chat />
          </>
        )}
      </header>
    </div>
  );
};

export default Main;

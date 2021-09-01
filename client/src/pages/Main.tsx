import React, { useState, useEffect, useContext } from "react";
import Welcome from "./Welcome";
import Chat from "./Chat";
import "./../css/main.css";

import { AppContext } from "../components/AppContext";

interface Props {}

const Main = (props: Props) => {
  const [isConnected, setIsConnected] = useState(false);

  const { socket } = useContext(AppContext);

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

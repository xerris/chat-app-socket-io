import React, { createContext, useEffect, useState } from "react";
import { Server, Socket } from "socket.io";
import socketIOClient from "socket.io-client";

const SocketContext = createContext(null);

const SocketProvider = (props: any) => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient("localhost:3001")
        : socketIOClient();

    if (socketConnection) {
      setSocket(socketConnection);
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };

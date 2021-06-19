import React, { createContext, useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";

const SocketContext = createContext(null);

const SocketProvider = (props: any) => {
  const [socket, setSocket] = useState<Socket>(null);

  const connectSocket = (username) => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient("localhost:3001", {
            withCredentials: true,
            extraHeaders: {
              "my-custom-header": "abcd"
            },
            auth: { username }
          })
        : socketIOClient(process.env.REACT_APP_SOCKET_CONNECTION, {
            withCredentials: true,
            extraHeaders: {
              "my-custom-header": "abcd"
            },
            auth: { username }
          });
    console.log(
      process.env.REACT_APP_ENV === "dev"
        ? "connecting to localhost:3001"
        : "connecting to server...",
      process.env.REACT_APP_SOCKET_CONNECTION
    );
    if (socketConnection) {
      console.log("Setting up socket connection");
      setSocket(socketConnection);
    }
  };

  return (
    <SocketContext.Provider value={{ connection: socket, connectSocket }}>
      {props.children}
    </SocketContext.Provider>
  );
};

export interface ISocketContext {
  connection: Socket | null;
  connectSocket: (username: string) => void;
}

export { SocketContext, SocketProvider };

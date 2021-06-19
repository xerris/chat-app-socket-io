import React, { createContext, useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";

const SocketContext = createContext(null);

const SocketProvider = (props: any) => {
  const [socket, setSocket] = useState<Socket>(null);

  useEffect(() => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient("localhost:3001", {
            withCredentials: true,
            extraHeaders: {
              "my-custom-header": "abcd"
            }
          })
        : socketIOClient(process.env.REACT_APP_SOCKET_CONNECTION, {
            withCredentials: true,
            extraHeaders: {
              "my-custom-header": "abcd"
            }
          });
    console.log(
      process.env.REACT_APP_ENV === "dev"
        ? "connecting to localhost:3001"
        : "connecting to server...",
      process.env.REACT_APP_SOCKET_CONNECTION
    );
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

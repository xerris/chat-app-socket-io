import React, { createContext, useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
require("dotenv").config({ path: "./.env" });

const SocketContext = createContext(null);

const SocketProvider = (props: any) => {
  const [socket, setSocket] = useState<Socket>(null);

  console.log(
    "🚀 ~ file: SocketContext.tsx ~ line 13 ~ useEffect ~ process.env.REACT_APP_ENV",
    process.env.REACT_APP_ENV
  );

  useEffect(() => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient("localhost:3001", {
            withCredentials: true,
            extraHeaders: {
              "my-custom-header": "abcd"
            }
          })
        : socketIOClient();
    console.log(
      process.env.REACT_APP_ENV === "dev"
        ? "connecting to localhost:3001"
        : "connecting to server..."
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

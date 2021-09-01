import React, { useReducer, createContext, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import { reducer } from "./Reducer";
import { prefix } from "../config/constants";
import { useSocketListeners } from "./useSocketListeners";

const AppContext = createContext(null);
export const initialState = {
  username: "",
  rooms: {},
  currentRoomId: "",
  privateMessages: {},
  privateRoomJoined: false,
  onlineUsers: [],
  allUsers: []
};

const AppProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [socket, setSocket] = useState<Socket>(null);
  useSocketListeners({ socketConnection: socket, dispatch });

  const connectSocket = (username?, sessionId?) => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient(`${prefix}`, {
            withCredentials: true,
            auth: { username, sessionId }
          })
        : socketIOClient(process.env.REACT_APP_SOCKET_CONNECTION, {
            withCredentials: true,
            auth: { username, sessionId }
          });

    if (socketConnection) {
      setSocket(socketConnection);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      localStorage.clear();
      setSocket(null);
    }
  };

  return (
    <AppContext.Provider
      value={{ state, dispatch, socket, connectSocket, disconnectSocket }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };

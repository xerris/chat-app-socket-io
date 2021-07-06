import React, { useReducer, createContext, useState } from "react";
import produce from "immer";
import {
  DispatchEvent,
  IMessage,
  State,
  IRoom,
  IUsersInRoom,
  IMessageList,
  IRoomUserList
} from "../utilities/interfaces";
import socketIOClient, { Socket } from "socket.io-client";
type Action =
  | { type: DispatchEvent.AddMessage; data: IMessage }
  | { type: DispatchEvent.SetUsername; data: string }
  | { type: DispatchEvent.SetOnlineUsers; data: string[] }
  | { type: DispatchEvent.SetInitialChatData; data: IMessageList }
  | { type: DispatchEvent.SetUsersInRoom; data: IUsersInRoom }
  | { type: DispatchEvent.SetUserRoomList; data: IRoom[] }
  | { type: DispatchEvent.SetPublicRoomList; data: IRoom[] }
  | { type: DispatchEvent.SetOnlineUsers; data: string[] }
  | { type: DispatchEvent.JoinRoomId; data: string }
  | { type: DispatchEvent.SetPrivateMessageList; data: IRoom[] };

const reducer = produce((state: State, action: Action) => {
  switch (action.type) {
    case DispatchEvent.AddMessage:
      state.rooms[action.data.room].messages.push(action.data);
      break;
    case DispatchEvent.SetUsername:
      state.username = action.data;
      break;
    case DispatchEvent.SetOnlineUsers:
      state.onlineUsers = action.data;
      break;
    case DispatchEvent.SetInitialChatData:
      console.log("initial chat data", action.data);
      state.rooms[action.data.roomId] = {
        ...state.rooms[action.data.roomId],
        messages: action.data.messages
      };
      break;

    case DispatchEvent.SetUsersInRoom:
      console.log("set users in room", action.data);
      state.rooms[action.data.roomId].users = action.data.users
        .sort((a, b) =>
          a.username.toLowerCase().localeCompare(b.username.toLowerCase())
        )
        .map((user) => user.username);
      break;
    case DispatchEvent.SetPublicRoomList:
      action.data.forEach(
        (room) =>
          (state.rooms[room.roomId] = {
            messages: [],
            users: [],
            newMessages: 0,
            roomName: room.roomName,
            joined: false
          })
      );
      break;
    case DispatchEvent.SetPrivateMessageList:
      action.data.forEach(
        (room) =>
          (state.privateMessages[room.roomId] = {
            messages: [],
            users: [],
            newMessages: 0,
            roomName: room.roomName,
            joined: false
          })
      );
      break;
    case DispatchEvent.JoinRoomId:
      state.currentRoomId = action.data;
      if (state.rooms[action.data]) {
        state.rooms[action.data].joined = true;
      }
      break;
  }
});

const AppContext = createContext(null);

const AppProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, {
    username: "",
    rooms: {},
    currentRoomId: "",
    onlineUsers: [],
    privateMessages: {}
  });
  const [socket, setSocket] = useState<Socket>(null);

  const connectSocket = (username?, sessionId?) => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient("localhost:3001", {
            withCredentials: true,
            extraHeaders: {
              "my-custom-header": "abcd"
            },
            auth: { username, sessionId }
          })
        : socketIOClient(process.env.REACT_APP_SOCKET_CONNECTION, {
            withCredentials: true,
            extraHeaders: {
              "my-custom-header": "abcd"
            },
            auth: { username, sessionId }
          });

    if (socketConnection) {
      setSocket(socketConnection);
      socketConnection.emit("joinRoom", { roomId: "1" });

      socketConnection.on("session", ({ sessionId, username }) => {
        // Store session in localStorage
        dispatch({ type: DispatchEvent.SetUsername, data: username });
        dispatch({ type: DispatchEvent.JoinRoomId, data: "1" });
        socketConnection.auth = { sessionId };
        localStorage.setItem("sessionId", sessionId);
      });

      socketConnection.on("message", (data: IMessage) => {
        dispatch({ type: DispatchEvent.AddMessage, data });
      });

      socketConnection.on(
        "onlineUserUpdate",
        (data: { username: string; connected: boolean }[]) => {
          dispatch({
            type: DispatchEvent.SetOnlineUsers,
            data: data.map((user) => user.username)
          });
        }
      );

      socketConnection.on("messageList", (data: IMessageList) => {
        dispatch({
          type: DispatchEvent.SetInitialChatData,
          data
        });
      });
      socketConnection.on("roomListUpdate", (data: IRoom[]) => {
        dispatch({
          type: DispatchEvent.SetPublicRoomList,
          data
        });
      });
      socketConnection.on("userRoomListUpdate", (data: IRoom[]) => {
        const filteredPrivateMessages = data.filter((room) => !!room.message);
        dispatch({
          type: DispatchEvent.SetPrivateMessageList,
          data: filteredPrivateMessages
        });
      });
      socketConnection.on("usersInRoom", (data: IUsersInRoom) => {
        dispatch({
          type: DispatchEvent.SetUsersInRoom,
          data
        });
      });
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

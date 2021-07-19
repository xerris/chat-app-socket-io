import React, { useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import {
  DispatchEvent,
  IMessage,
  IRoom,
  IUsersInRoom,
  IMessageList
} from "../utilities/interfaces";

interface Props {
  socketConnection: Socket;
  dispatch: any;
}

export const useSocketListeners = ({ socketConnection, dispatch }: Props) => {
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("joinRoom", { roomId: "1" });

      socketConnection.on("session", ({ sessionId, username }) => {
        // Store session in localStorage
        dispatch({ type: DispatchEvent.SetUsername, data: username });
        dispatch({
          type: DispatchEvent.JoinRoomId,
          data: { roomId: "1", private: false }
        });
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
      socketConnection.on("privateMessageList", (data: IMessageList) => {
        dispatch({
          type: DispatchEvent.SetInitalPrivateMessageData,
          data
        });
      });
      socketConnection.on("roomListUpdate", (data: IRoom[]) => {
        dispatch({
          type: DispatchEvent.SetPublicRoomList,
          data
        });
      });
      socketConnection.on("allUserUpdate", (data: any) => {
        dispatch({
          type: DispatchEvent.UserListUpdate,
          data
        });
      });
      socketConnection.on("usersInRoom", (data: IUsersInRoom) => {
        dispatch({
          type: DispatchEvent.SetUsersInRoom,
          data
        });
      });
      socketConnection.on("privateMessageCreation", (roomId: string) => {
        socketConnection.emit("joinPrivateMessage", roomId);
      });

      // Log all socket items
      socketConnection.onAny((data, params) =>
        console.log("🚀 SOCKET:", data, params)
      );

      return () => {
        socketConnection.offAny();
        socketConnection.off("session");
        socketConnection.off("message");
        socketConnection.off("onlineUserUpdate");
        socketConnection.off("messageList");
        socketConnection.off("privateMessageList");
        socketConnection.off("roomListUpdate");
        socketConnection.off("allUserUpdate");
        socketConnection.off("usersInRoom");
        socketConnection.off("privateMessageCreation");
      };
    }
  }, [socketConnection]);

  return;
};

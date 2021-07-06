import produce from "immer";
import {
  DispatchEvent,
  IMessage,
  IMessageList,
  IRoom,
  IUsersInRoom,
  State
} from "../utilities/interfaces";
import { initialState } from "./AppContext";

type Action =
  | { type: DispatchEvent.AddMessage; data: IMessage }
  | { type: DispatchEvent.SetUsername; data: string }
  | { type: DispatchEvent.SetOnlineUsers; data: string[] }
  | { type: DispatchEvent.SetInitialChatData; data: IMessageList }
  | { type: DispatchEvent.SetUsersInRoom; data: IUsersInRoom }
  | { type: DispatchEvent.SetUserRoomList; data: IRoom[] }
  | { type: DispatchEvent.SetPublicRoomList; data: IRoom[] }
  | { type: DispatchEvent.SetOnlineUsers; data: string[] }
  | {
      type: DispatchEvent.JoinRoomId;
      data: { private: boolean; roomId: string };
    }
  | {
      type: DispatchEvent.JoinPrivateMessageId;
      data: { private: boolean; roomId: string };
    }
  | { type: DispatchEvent.SetInitalPrivateMessageData; data: IMessageList }
  | { type: DispatchEvent.JoinInitialRooms; data: IRoom[] }
  | { type: DispatchEvent.UserListUpdate; data: any }
  | { type: DispatchEvent.Logout };

export const reducer = produce((state: State, action: Action) => {
  switch (action.type) {
    case DispatchEvent.AddMessage:
      if (state.privateMessages[action.data.room]) {
        state.privateMessages[action.data.room].messages.push(action.data);
      } else if (state.rooms[action.data.room]) {
        state.rooms[action.data.room].messages.push(action.data);
      }
      break;
    case DispatchEvent.SetUsername:
      state.username = action.data;
      break;
    case DispatchEvent.SetOnlineUsers:
      state.onlineUsers = action.data;
      break;
    case DispatchEvent.SetInitialChatData:
      state.rooms[action.data.roomId] = {
        ...state.rooms[action.data.roomId],
        messages: action.data.messages
      };
      break;

    case DispatchEvent.SetUsersInRoom:
      // Private message
      if (action.data.users[0]?.receiver) {
        const otherUser = action.data.users.find(
          (user) => user.receiver !== state.username
        );

        if (otherUser?.receiver && state.privateMessages[action.data.roomId]) {
          state.privateMessages[action.data.roomId].receivingUser =
            otherUser.receiver;
        } else if (otherUser?.receiver) {
          state.privateMessages[action.data.roomId] = {
            receivingUser: otherUser.receiver,
            joined: true,
            messages: [],
            newMessages: 0,
            roomId: action.data.roomId
          };
        }
      } else if (state.rooms[action.data.roomId]) {
        // Normal room update
        state.rooms[action.data.roomId].users = action.data.users
          .sort((a, b) =>
            a.username.toLowerCase().localeCompare(b.username.toLowerCase())
          )
          .map((user) => user.username);
      }
      break;
    case DispatchEvent.SetPublicRoomList:
      action.data.forEach((room) => {
        state.rooms[room.roomId] = {
          messages: [],
          users: [],
          newMessages: 0,
          roomName: room.roomName,
          joined: false
        };
      });
      break;
    case DispatchEvent.SetInitalPrivateMessageData:
      if (state.privateMessages[action.data.roomId]) {
        state.privateMessages[action.data.roomId] = {
          ...state.privateMessages[action.data.roomId],
          messages: action.data.messages || []
        };
      } else {
        state.privateMessages[action.data.roomId] = {
          messages: action.data.messages || [],
          joined: true,
          newMessages: 1,
          receivingUser: action.data.receiver,
          roomId: action.data.roomId
        };
      }
      break;
    case DispatchEvent.JoinInitialRooms:
      action.data.forEach(
        (room) =>
          (state.rooms[room.roomId] = {
            ...state.rooms[room.roomId],
            joined: true
          })
      );
      break;
    case DispatchEvent.JoinRoomId:
      state.currentRoomId = action.data.roomId;
      state.privateRoomJoined = action.data.private;
      if (!action.data.private && state.rooms[action.data.roomId]) {
        state.rooms[action.data.roomId].joined = true;
      }
      break;
    case DispatchEvent.JoinPrivateMessageId:
      state.privateRoomJoined = action.data.private;
      state.currentRoomId = action.data.roomId;
      if (action.data.private && state.privateMessages[action.data.roomId]) {
        state.privateMessages[action.data.roomId].joined = true;
      }
      break;
    case DispatchEvent.UserListUpdate:
      state.allUsers = action.data.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      break;
    case DispatchEvent.Logout:
      state = initialState;
      break;
  }
});

export interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface IRoomUserList {
  PK: string;
  SK: string;
  roomId: string;
  roomName: string;
  username: string;
}
export interface IRoom {
  roomId: string;
  roomName: string;
  message?: boolean;
  receiver?: string;
}

export interface IUsersInRoom {
  roomId: string;
  users: IRoomUserList[];
}
export interface IMessage {
  SK: string;
  PK: string;
  message: string;
  username: string;
  timestamp: number;
  room: string;
}
export interface IMessageList {
  roomId: string;
  messages: IMessage[];
}

export enum DispatchEvent {
  SetUsername,
  AddMessage,
  SetOnlineUsers,
  SetInitialChatData,
  SetUserRoomList,
  SetPublicRoomList,
  SetPrivateMessageList,
  SetUsersInRoom,
  JoinRoomId
}

export interface MessageStore {
  [key: string]: {
    messages: ISocketMessage[];
    newMessages: number;
    users: string[];
    roomName: string;
    joined: boolean;
  };
}

export interface State {
  rooms: MessageStore;
  privateMessages: MessageStore;
  username: string;
  currentRoomId: string;
  onlineUsers: string[];
}

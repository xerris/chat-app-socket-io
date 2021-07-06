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
  receiver?: string;
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
  receiver?: string;
}

export enum DispatchEvent {
  SetUsername,
  AddMessage,
  SetOnlineUsers,
  SetInitialChatData,
  SetUserRoomList,
  SetPublicRoomList,
  SetInitalPrivateMessageData,
  SetUsersInRoom,
  JoinRoomId,
  JoinPrivateMessageId,
  JoinInitialRooms,
  UserListUpdate,
  Logout
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

export interface IPrivateMessage {
  messages: ISocketMessage[];
  newMessages: number;
  receivingUser: string;
  roomId: string;
  joined: boolean;
}
export interface PrivateMessageStore {
  [key: string]: IPrivateMessage;
}

export interface State {
  rooms: MessageStore;
  privateMessages: PrivateMessageStore;
  username: string;
  currentRoomId: string;
  onlineUsers: string[];
  allUsers: string[];
  privateRoomJoined: boolean;
}

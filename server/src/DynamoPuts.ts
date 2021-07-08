import { dynamo } from "./Dynamo";
import { v4 as uuidv4 } from "uuid";

import * as bcrypt from "bcrypt";
import { ISocketMessage } from "./SocketManager";

const createRoomList = async (
  roomList: {
    roomName: string;
    id: string;
  }[]
) => {
  await dynamo
    .put({
      TableName: "xerris-socket-app-db",
      Item: {
        PK: `ROOMLIST`,
        SK: `ROOMLIST`,
        roomList
      }
    })
    .promise();
};

export const joinRoom = async (
  roomId: string,
  userId: string,
  username: string,
  isMessage: boolean
) => {
  await dynamo
    .put({
      TableName: "xerris-socket-app-db",
      Item: {
        PK: `user#${username}`,
        SK: `#ROOM#${roomId}`,
        message: isMessage,
        roomName: "Sample room",
        username,
        roomId
      }
    })
    .promise();
};
export const leaveRoom = async (roomId: string, userId: string) => {
  await dynamo
    .delete({
      TableName: "xerris-socket-app-db",
      Key: {
        PK: `user#${userId}`,
        SK: `#ROOM#${roomId}`
      }
    })
    .promise();
};

export const createPrivateMessage = async (
  senderUserId: string,
  receiverUserId: string
) => {
  const uuid = uuidv4();
  await dynamo
    .put({
      TableName: "xerris-socket-app-db",
      Item: {
        PK: `user#${senderUserId}`,
        SK: `#PRIVATEMESSAGE#${uuid}`,
        roomName: "Private Message",
        message: true,
        roomId: uuid,
        username: senderUserId,
        receiver: receiverUserId
      }
    })
    .promise();
  await dynamo
    .put({
      TableName: "xerris-socket-app-db",
      Item: {
        PK: `user#${receiverUserId}`,
        SK: `#PRIVATEMESSAGE#${uuid}`,
        roomName: "Private Message",
        message: true,
        roomId: uuid,
        username: receiverUserId,
        receiver: senderUserId
      }
    })
    .promise();

  return uuid;
};

export const saveRoomMessage = async (m: ISocketMessage) => {
  return new Promise(async (resolve, reject) => {
    console.log("🚀 ~ file: DynamoPuts.ts ~ line 112 ~ saveRoomMessage ~ m", m);

    try {
      if (m.privateMessage) {
        await dynamo
          .put({
            TableName: "xerris-socket-app-db",
            Item: {
              PK: `#PRIVATEMESSAGE#${m.room}`,
              SK: `#MESSAGE#${m.username}${Date.now()}`,
              username: m.username,
              message: m.message,
              timestamp: m.timestamp,
              roomName: m.privateMessage ? "Private Message" : ""
            }
          })
          .promise();
      } else {
        await dynamo
          .put({
            TableName: "xerris-socket-app-db",
            Item: {
              PK: `#ROOM#${m.room}`,
              SK: `#MESSAGE#${m.username}${Date.now()}`,
              username: m.username,
              message: m.message,
              timestamp: m.timestamp,
              roomName: m.privateMessage ? "Private Message" : ""
            }
          })
          .promise();
      }
      resolve("Success");
    } catch (error) {
      console.log("error posting message", m, error);
      reject(error);
    }
  });
};

export interface IDeleteMessage {
  room: string;
  username: string;
  timestamp: string;
}

export const deleteRoomMessage = async (m: IDeleteMessage) => {
  return new Promise(async (resolve, reject) => {
    try {
      await dynamo
        .delete({
          TableName: "xerris-socket-app-db",
          Item: {
            PK: `#ROOM#${m.room}`,
            SK: `#MESSAGE#${m.username}${m.timestamp}`
          }
        })
        .promise();
      resolve("Success");
    } catch (error) {
      console.log("error posting message", m, error);
      reject(error);
    }
  });
};

export interface ICreateUser {
  username: string;
  password: string;
  email: string;
}

export const createUser = async (user: ICreateUser) =>
  new Promise((resolve, reject) => {
    try {
      if (!(user.password && user.email && user.username)) {
        reject("Missing credentials");
      }
      bcrypt.hash(user.password, 10, async (err, hash) => {
        await dynamo
          .put({
            TableName: "xerris-socket-app-db",
            Item: {
              PK: `user#${user.username}`,
              SK: `#METADATA`,
              hash,
              email: user.email,
              username: user.username,
              timestamp: Date.now()
            }
          })
          .promise();
      });
      resolve("Success");
    } catch (err) {
      reject("Fail");
    }
  });

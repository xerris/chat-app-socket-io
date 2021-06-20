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
        SK: `#ROOM#${uuid}`,
        roomName: "Private Message",
        message: true,
        roomid: uuid,
        username: senderUserId
      }
    })
    .promise();
  await dynamo
    .put({
      TableName: "xerris-socket-app-db",
      Item: {
        PK: `user#${receiverUserId}`,
        SK: `#ROOM#${uuid}`,
        roomName: "Private Message",
        message: true,
        roomid: uuid,
        username: receiverUserId
      }
    })
    .promise();
};

export const saveRoomMessage = async (m: ISocketMessage) => {
  return new Promise(async (resolve, reject) => {
    console.log("🚀 ~ file: DynamoPuts.ts ~ line 112 ~ saveRoomMessage ~ m", m);

    try {
      await dynamo
        .put({
          TableName: "xerris-socket-app-db",
          Item: {
            PK: `#ROOM#${m.room}`,
            SK: `#MESSAGE#${m.username}${Date.now()}`,
            username: m.username,
            message: m.message,
            timestamp: m.timestamp
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
// Sample queries (can be run if Dynamo is connected)
// joinRoom("3333", "id-1", "bobby", false);
// leaveRoom("3333", "id-1");
// createPrivateMessage("bobby", "rexx92");
// createRoomList([
//   {
//     roomName: "Lobby",
//     id: "001"
//   },
//   {
//     roomName: "Tech",
//     id: "002"
//   },
//   {
//     roomName: "Coffee",
//     id: "003"
//   },
//   {
//     roomName: "Whiteboard",
//     id: "004"
//   }
// ]);

// saveRoomMessage({
//   message: "Hello Bobby",
//   room: "1f2e9e95-528b-40cf-ade1-d5e47c082fda",
//   timestamp: Date.now(),
//   username: "rexx92"
// });
// saveRoomMessage({
//   message: "Hello Alex",
//   room: "1f2e9e95-528b-40cf-ade1-d5e47c082fda",
//   timestamp: Date.now(),
//   username: "bobby"
// });

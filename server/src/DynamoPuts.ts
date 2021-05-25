import { dynamo } from "./Dynamo";
import { v4 as uuidv4 } from "uuid";
import { ISocketMessage } from "./App";

const createRoomList = async (
  roomList: {
    roomName: string;
    id: string;
  }[]
) => {
  await dynamo
    .put({
      TableName: "xerris",
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
      TableName: "xerris",
      Item: {
        PK: `user#${userId}`,
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
      TableName: "xerris",
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
      TableName: "xerris",
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
      TableName: "xerris",
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
    try {
      await dynamo
        .put({
          TableName: "xerris",
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

// Sample queries (can be run if Dynamo is connected)
joinRoom("3333", "id-1", "bobby", false);
leaveRoom("3333", "id-1");
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

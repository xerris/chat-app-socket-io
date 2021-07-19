import { dynamo } from "./Dynamo";
import * as bcrypt from "bcrypt";

export interface IUserRoom {
  PK: string;
  SK: string;
  roomName: string;
  roomId: string;
  message: boolean;
  messages?: IRoomMessage[];
  receiver?: string;
}

interface GetUsersInRoomQueryReponse {
  Items: IUserRoom[];
}

const TableName = process.env.DYNAMODB_TABLE_NAME;

export const getUsersInRoom = async (roomId: string) => {
  // All users in a particular room
  const usersInRoomQuery: GetUsersInRoomQueryReponse = await dynamo
    .query({
      TableName,
      IndexName: "SK-PK-inverted-index",
      KeyConditionExpression: "SK = :sk and begins_with(PK, :pk) ",
      ExpressionAttributeValues: {
        ":sk": `#ROOM#${roomId}`,
        ":pk": `user#`
      }
    })
    .promise();
  return usersInRoomQuery.Items;
};

export interface IRoomMessage {
  PK: string;
  SK: string;
  message: string;
  username: string;
  timestamp: number;
}

interface GetMessagesForRoomQueryResponse {
  Items: IRoomMessage[];
}

export const getMessagesForRoom = async (roomId: string) => {
  // Get messages for room
  const roomMessageList: GetMessagesForRoomQueryResponse = await dynamo
    .query({
      TableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `#ROOM#${roomId}`,
        ":sk": "#MESSAGE"
      }
    })
    .promise();
  return { roomId, messages: roomMessageList.Items };
};
export const getPrivateMessagesForRoom = async (roomId: string) => {
  // Get messages for room
  const roomMessageList: GetMessagesForRoomQueryResponse = await dynamo
    .query({
      TableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `#PRIVATEMESSAGE#${roomId}`,
        ":sk": "#MESSAGE"
      }
    })
    .promise();
  return { roomId, messages: roomMessageList.Items };
};

export interface IUserMetadata {
  PK: string;
  SK: string;
  username: string;
  userId: string;
}

interface GetUserMetadataQueryResponse {
  Items: IUserMetadata[];
}

export const getMetadataForUser = async (userId: string) => {
  // The metaData for a user...not really using this method
  const userMetadataQuery: GetUserMetadataQueryResponse = await dynamo
    .query({
      TableName,
      KeyConditionExpression: "PK = :pk and SK=:sk ",
      ExpressionAttributeValues: {
        ":pk": `user#${userId}`,
        ":sk": `#METADATA`
      }
    })
    .promise();
  console.log(
    "🚀 ~ file: sampleQuery.ts ~ line 43 ~ getMetadataForUser ~ userMetadataQuery",
    userMetadataQuery
  );
  return userMetadataQuery;
};

export interface IUserRoom {
  PK: string;
  SK: string;
  // Message indicates private message
  message: boolean;
  username: string;
  roomName: string;
  roomId: string;
}

interface GetRoomlistForUserQueryResponse {
  Items: IUserRoom[];
}

export const getRoomlistForUser = async (username: string) => {
  // Rooms a particular user is in
  const userRoomQuery: { Items: IUserRoom[] } = await dynamo
    .query({
      TableName,
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk) ",
      ExpressionAttributeValues: {
        ":pk": `user#${username}`,
        ":sk": `#ROOM`
      }
    })
    .promise();

  return userRoomQuery?.Items;
};
export const getPrivateMessagesForUser = async (username: string) => {
  // Rooms a particular user is in
  const userRoomQuery: { Items: IUserRoom[] } = await dynamo
    .query({
      TableName,
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk) ",
      ExpressionAttributeValues: {
        ":pk": `user#${username}`,
        ":sk": `#PRIVATEMESSAGE`
      }
    })
    .promise();

  return userRoomQuery?.Items;
};

export interface IRoom {
  PK: string;
  SK: string;
  username: string;
  userId: string;
}

interface GetRoomlistQueryResponse {
  Items: [{ roomList: IRoom[] }];
}

export const getAllUsers = async () => {
  // General RoomList
  const userQuery = await dynamo
    .query({
      TableName,
      IndexName: "SK-PK-inverted-index",
      KeyConditionExpression: "SK = :sk AND begins_with(PK, :pk)  ",
      ExpressionAttributeValues: {
        ":pk": `user#`,
        ":sk": `#METADATA`
      }
    })
    .promise();

  return userQuery?.Items;
};
export const getRoomList = async () => {
  // General RoomList
  const roomListQuery: GetRoomlistQueryResponse = await dynamo
    .query({
      TableName,
      KeyConditionExpression: "PK = :pk  ",
      ExpressionAttributeValues: {
        ":pk": `#ROOMMETADATA`
        // ":sk": `ROOMLIST`
      }
    })
    .promise();

  return roomListQuery?.Items;
};

export interface IUser {
  username: string;
  password: string;
}

export interface DynamoUserResponse {
  Items: {
    hash: string;
    email: string;
    username: string;
  }[];
}

export const verifyLogin = async (user: IUser) =>
  new Promise(async (resolve, reject) => {
    const userInfo: DynamoUserResponse = await dynamo
      .query({
        TableName,
        KeyConditionExpression: "PK = :pk and SK=:sk ",
        ExpressionAttributeValues: {
          ":pk": `user#${user.username}`,
          ":sk": `#METADATA`
        }
      })
      .promise();

    if (userInfo?.Items?.[0]?.hash) {
      await bcrypt.compare(
        user.password,
        userInfo.Items[0].hash,
        (err, result) => {
          console.log(
            "🚀 ~ file: DynamoQueries.ts ~ line 176 ~ newPromise ~ result",
            result
          );
          if (result) {
            resolve({
              username: user.username,
              email: userInfo.Items[0].email
            });
          } else {
            reject("Incorrect credentials");
          }
        }
      );
    } else {
      reject("User does not exist");
    }
  });

export const checkValidUser = async (username: string) => {
  // General RoomList
  const userQuery: { Items: IUser[] } = await dynamo
    .query({
      TableName,
      KeyConditionExpression: "PK = :pk and SK=:sk",
      ExpressionAttributeValues: {
        ":pk": `user#${username.toLowerCase()}`,
        ":sk": `#METADATA`
      }
    })
    .promise();

  if (userQuery.Items.length) {
    return false;
  }
  return true;
};

import { dynamo } from "./Dynamo";
const env = process.env.ENV;

export interface IUserRoom {
  PK: string;
  SK: string;
  roomName: string;
  roomId: string;
  message: boolean;
}

interface GetUsersInRoomQueryReponse {
  Items: IUserRoom[];
}
export const getUsersInRoom = async (roomId: string) => {
  // All users in a particular room
  const usersInRoomQuery: GetUsersInRoomQueryReponse = await dynamo
    .query({
      TableName: "xerris-socket-app-db",
      IndexName: "SK-PK-inverted-index",
      KeyConditionExpression: "SK = :sk and begins_with(PK, :pk) ",
      ExpressionAttributeValues: {
        ":sk": `#ROOM#${roomId}`,
        ":pk": `user#`
      }
    })
    .promise();
  console.log("🚀 ~ file: sampleQuery.ts ~", usersInRoomQuery);
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
      TableName: "xerris-socket-app-db",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `#ROOM#${roomId}`,
        ":sk": "#MESSAGE"
      }
    })
    .promise();
  return roomMessageList.Items;
  console.log("🚀 ~ file: roomMessageList", roomMessageList.Items);
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
      TableName: "xerris-socket-app-db",
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
  const userRoomQuery: any = await dynamo
    .query({
      TableName: "xerris-socket-app-db",
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk) ",
      ExpressionAttributeValues: {
        ":pk": `user#${username}`,
        ":sk": `#ROOM`
      }
    })
    .promise();
  console.log("🚀 ~ file: sampleQuery.ts ~", userRoomQuery);
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

export const getRoomList = async () => {
  // General RoomList
  const roomListQuery: GetRoomlistQueryResponse = await dynamo
    .query({
      TableName: "xerris-socket-app-db",
      KeyConditionExpression: "PK = :pk and SK=:sk ",
      ExpressionAttributeValues: {
        ":pk": `ROOMLIST`,
        ":sk": `ROOMLIST`
      }
    })
    .promise();
  console.log(
    "🚀 ~ file: sampleQuery.ts ~ line 173 ~ getRoomList ~ roomListQuery.Items?",
    roomListQuery.Items
  );
  roomListQuery.Items[0].roomList.forEach((room: any) =>
    console.log("room", room)
  );
};

// getRoomList();
// getMessagesForRoom("1f2e9e95-528b-40cf-ade1-d5e47c082fda");
// getUsersInRoom("1f2e9e95-528b-40cf-ade1-d5e47c082fda");
// getRoomlistForUser("rexx92");

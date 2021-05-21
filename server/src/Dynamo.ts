var AWS = require("aws-sdk");
import { ISocketMessage } from "./App";
var credentials = new AWS.SharedIniFileCredentials({ profile: "dynamo" });

AWS.config.update({
  region: "us-west-2",
  endpoint: "https://dynamodb.us-west-2.amazonaws.com",
  credentials: credentials
});
// May need to put credentials in here once deployed
var dynamo = new AWS.DynamoDB.DocumentClient();

export interface DynamoMessageQuery {
  SK: string;
  PK: string;
  message: string;
  username: string;
  timestamp: number;
}

interface DynamoQueryResponse {
  Items: DynamoMessageQuery[];
}
export const getMessagesForRoom = async (roomName: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const roomMessageList: DynamoQueryResponse = await dynamo
        .query({
          TableName: "xerris",
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `ROOM#${roomName}`,
            ":sk": "#MESSAGE"
          }
        })
        .promise();

      resolve(roomMessageList.Items);
    } catch (err) {
      console.log("err querying", err);
      reject(err);
    }
  });
};

export const saveRoomMessage = async (m: ISocketMessage) => {
  return new Promise(async (resolve, reject) => {
    try {
      await dynamo
        .put({
          TableName: "xerris",
          Item: {
            PK: `ROOM#${m.room}`,
            SK: `#MESSAGE#${m.username}${Date.now()}`,
            username: m.username,
            message: m.message,
            timestamp: m.timestamp
          }
        })
        .promise();
    } catch (error) {
      console.log("error posting message", m, error);
      reject(error);
    }
  });
};

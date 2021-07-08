var AWS = require("aws-sdk");
if (process.env.ENV === "dev") {
  AWS.config.update({
    region: "us-east-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
  });
}
// May need to put credentials in here once deployed
if (process.env.ENV === "prod") {
  try {
    AWS.config.update({
      region: "us-east-2",
      endpoint: "https://dynamodb.us-east-2.amazonaws.com"
    });
  } catch (err) {
    console.log("DYNAMO err", err);
  }
}
const dynamo = new AWS.DynamoDB.DocumentClient({
  region: "us-east-2"
});
export { dynamo };

var AWS = require("aws-sdk");
if (process.env.ENV === "dev") {
  var credentials = new AWS.SharedIniFileCredentials({
    profile: "dynamo",
    region: "us-west-2"
  });
  AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com",
    credentials: credentials
  });
}
// May need to put credentials in here once deployed
if (process.env.ENV === "prod") {
  var credentials = new AWS.SharedIniFileCredentials({
    profile: "default",
    region: "us-east-2"
  });

  try {
    AWS.config.update({
      region: "us-east-2",
      endpoint: "https://dynamodb.us-east-2.amazonaws.com",
      credentials: credentials
    });
  } catch (err) {
    console.log("DYNAMO err", err);
  }
}
const dynamo = new AWS.DynamoDB.DocumentClient({
  region: "us-east-2"
});
export { dynamo };

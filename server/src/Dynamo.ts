var AWS = require("aws-sdk");
console.log("🚀 ~ file: Dynamo.ts ~ line 3 ~ process.env.ENV", process.env);
if (process.env.ENV === "dev") {
  var credentials = new AWS.SharedIniFileCredentials({ profile: "dynamo" });

  AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com",
    credentials: credentials
  });
}
// May need to put credentials in here once deployed
var dynamo = new AWS.DynamoDB.DocumentClient();
export { dynamo };

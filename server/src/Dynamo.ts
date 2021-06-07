var AWS = require("aws-sdk");
console.log("🚀 ~ file: Dynamo.ts ~ line 3 ~ process.env.ENV", process.env);
if (process.env.ENV === "dev") {
}
// May need to put credentials in here once deployed
let dynamo;
try {
  var credentials = new AWS.SharedIniFileCredentials({ profile: "default" });

  AWS.config.update({
    region: "us-east-2",
    endpoint: "https://dynamodb.us-east-2.amazonaws.com",
    credentials: credentials
  });
  dynamo = new AWS.DynamoDB.DocumentClient();
} catch (err) {
  console.log("DYNAMO err", err);
}
export { dynamo };

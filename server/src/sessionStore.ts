import { RedisClient } from "redis";

const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([username, connected]: string[]) => {
  return {
    username,
    connected
  };
};

class RedisSessionStore {
  redisClient: RedisClient;
  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  findSession(id: String): Promise<any> {
    return new Promise((resolve, reject) =>
      this.redisClient.hmget(
        `session:${id}`,
        "username",
        "connected",
        (err: Error | null, valueArray: string[] | null) => {
          if (valueArray) {
            return resolve(mapSession(valueArray));
          }
          if (err) {
            reject(err);
          }
          reject();
        }
      )
    );
  }

  saveSession(id: string, { username, connected }: { [key: string]: string }) {
    this.redisClient
      .multi()
      .hmset(`session:${id}`, "username", username, "connected", connected)
      .expire(`session:${id}`, SESSION_TTL)
      .exec();
  }

  getOnlineUsers = async () => {
    const keys = new Set();
    let cursor = "0";
    do {
      await new Promise((resolve, reject) =>
        this.redisClient.scan(
          cursor,
          "MATCH",
          "session:*",
          "COUNT",
          "100",
          (err, reply) => {
            cursor = reply[0];
            reply[1].forEach((key: string) => keys.add(key));
            if (cursor === "0") {
              resolve("ok");
            }
          }
        )
      );
    } while (cursor !== "0");

    const commands: any[] = [];
    keys.forEach((key: unknown) =>
      commands.push(["hmget", key, "username", "connected"])
    );

    return await new Promise((resolve, reject) => {
      this.redisClient.multi(commands).exec((err, reply) => {
        const userArray = reply.map((result: string[]) => mapSession(result));

        return resolve(userArray.filter((user) => user.connected === "true"));
      });
    });
  };
}

export { RedisSessionStore };

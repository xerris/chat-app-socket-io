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
          console.log("vals from findSession", valueArray);
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
      .hset(`session:${id}`, "username", username, "connected", connected)
      .expire(`session:${id}`, SESSION_TTL)
      .exec();
  }
}

export { RedisSessionStore };

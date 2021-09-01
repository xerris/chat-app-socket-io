import { Request, Response } from "express";
import { createUser } from "./DynamoPuts";
import { verifyLogin } from "./DynamoQueries";

const registerRoutes = (dynamoEnabled: boolean) => {
  const express = require("express");
  const router = express.Router();

  router.post("/login", async (req: Request, res: Response) => {
    if (dynamoEnabled) {
      try {
        const loginResult = await verifyLogin({
          username: req.body.username,
          password: req.body.password
        });

        if (loginResult) {
          res.send(JSON.stringify(loginResult));
        } else {
          return res.sendStatus(500);
        }
      } catch (err) {
        return res.sendStatus(500);
      }
    } else {
      res.send(
        JSON.stringify({
          username: req.body.username,
          email: "test@test.com"
        })
      );
    }
  });
  router.post("/signup", async (req: Request, res: Response) => {
    try {
      const signupResult = await createUser({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      });
      if (signupResult) {
        return res.sendStatus(200);
      } else {
        return res.sendStatus(500);
      }
    } catch (err) {
      return res.sendStatus(500);
    }
  });

  return router;
};

export default registerRoutes;

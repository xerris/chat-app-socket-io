import { Request, Response } from "express";
import { createUser } from "./DynamoPuts";
import { verifyLogin } from "./DynamoQueries";

const express = require("express");
const router = express.Router();

console.log("setting up routes");
router.get("/login", (req: Request, res: Response) => {
  console.log("loging GET", req.body);
  res.send("ok");
});

router.post("/login", async (req: Request, res: Response) => {
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

export default router;

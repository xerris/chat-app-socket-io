import { Request, Response } from "express";

const express = require("express");
const router = express.Router();

console.log("setting up routes");
router.get("/login", (req: Request, res: Response) => {
  console.log("loging GET", req.body);
  res.send("ok");
});

router.post("/login", (req: Request, res: Response) => {
  console.log(
    "🚀 ~ file: App.ts ~ line 97 ~ app.post ~ req",
    req.body.username
  );
  // const loginInfo = req.body;
  // const userInfo = dynamoDB.get(username)
  const userInfo = "9e0dsjkljas";

  // bcrypt.compare(loginInfo.password, userInfo, (err, result) => {
  //   if (result) {
  //     res.cookie("userID", "test");
  //     return res.redirect("/app");
  //   }
  //   return res.redirect("/login/401");
  // });
});

export default router;

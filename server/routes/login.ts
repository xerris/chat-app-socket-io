const express = require("express");
const router = express.Router();
const database = require("../server/database.js");

router.get("/", (req, res) => {
  // database.quert
});

router.post("/logout", (req, res) => {
  res.clearCookie("userId");
});


export router;
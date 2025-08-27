const express = require("express");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");

const router = express.Router();

// Create new user
router.post("/", async (req, res) => {
  const { name, email } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error("Email already registered");
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }

  const user = await User.create({ name, email });
  res.status(StatusCodes.CREATED).json(user);
});

module.exports = router;

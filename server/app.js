const express = require("express");
require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const sequelize = require("./config/sequelize");
// const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

// app.use("/users", userRoutes);
app.use("/", (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "ok" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error caught:", err.message);

  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    err.message || "Something went wrong. Please try again later.";

  res.status(status).json({ error: message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

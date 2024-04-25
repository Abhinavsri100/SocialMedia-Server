/** @format */

const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5001;
const { connect } = require("./config/database");
const authRouter = require("./routers/authRouter");
const postsRouter = require("./routers/postsRouter");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
//morgan gives the api that we have just hit
app.use(morgan("common"));
app.use("/auth", authRouter);
console.log("first");
app.use("/posts", postsRouter);
app.use("/user", userRouter);
console.log("first");
connect();
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
  });
});
app.listen(PORT, () => {
  console.log("Listening on PORT ", PORT);
});

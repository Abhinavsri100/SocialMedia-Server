/** @format */
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { hash } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");
exports.loginController = async (req, res) => {
  try {
    console.log("hellll");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send(error(400, "All fields are required"));
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.send(error(404, "User is not registered"));
    }
    const matched = await bcrypt.compare(password, existingUser.password);
    if (!matched) {
      // return res.status(403).send("Incorrect password");
      return res.send(error(403, "ncorrect password"));
    }
    const accessToken = generateAccessToken({
      _id: existingUser._id,
      email: existingUser.email,
      password: existingUser.password,
    });
    const refreshAccessToken = generateRefreshAccessToken({
      _id: existingUser._id,
      email: existingUser.email,
      password: existingUser.password,
    });
    // req.user.id = existingUser._id;
    // console.log(req);
    // return res.status(201).json({
    //   success: true,
    //   messgae: "User logged in successfully",
    //   accessToken,
    //   refreshAccessToken,
    // });

    res.cookie("jwt", refreshAccessToken, {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, { accessToken }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
exports.signupController = async (req, res) => {
  try {
    console.log("hellll");
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.send(error(400, "All fields are required"));
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.send(error(409, "User is already registered"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = {
      publicId: "",
      url: "",
    };
    const bio = "";
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      bio,
    });
    // console.log("ends here");
    return res.send(success(201, { newUser }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
//this will check the refresh token validity and generate the new access token
exports.refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token in cookie is required"));
  }
  const refreshToken = cookies.jwt;
  console.log("referesh token ", refreshToken);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    req._id = decoded._id;
    // next();
    // const _id = decoded._id;
    // const email = decoded.email;
    // const password = decoded.password;
    const accessToken = generateAccessToken({
      _id: decoded._id,
      email: decoded.email,
      password: decoded.password,
    });
    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    return res.send(error(401, "Invalid refresh token"));
  }
};

exports.logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    return res.send(success(200, "User logged OUt"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const generateAccessToken = (existingUser) => {
  try {
    const token = jwt.sign(existingUser, process.env.JWT_SECERET, {
      expiresIn: "2d",
    });
    console.log("token", token);
    return token;
  } catch (e) {
    console.log(e);
  }
};
const generateRefreshAccessToken = (existingUser) => {
  try {
    const token = jwt.sign(existingUser, process.env.REFRESH_SECRET, {
      expiresIn: "1y",
    });
    console.log("token", token);
    return token;
  } catch (e) {
    console.log(e);
  }
};

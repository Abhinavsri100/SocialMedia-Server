/** @format */
const jwt = require("jsonwebtoken");
const { error } = require("../utils/responseWrapper");
const { success } = require("../utils/responseWrapper");
const User = require("../models/User");
exports.requireUser = async (req, res, next) => {
  console.log("start of ru");
  // console.log(req);
  // console.log(req.body);
  // console.log(req.headers.cookie);
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.send(error(401, "Authorization header is required"));
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  console.log("accessToken--> ", accessToken);
  try {
    console.log("Hello");
    const decode = jwt.verify(accessToken, "Abhinav");
    console.log("Decode--> ", decode);
    req._id = decode._id;
    const user = User.findById(req._id);
    if (!user) {
      return res.send(error(404, "User no longer exist"));
    }
    console.log("id---->", req._id);
    next();
  } catch (e) {
    console.log(e.message);
    return res.send(error(401, "Invalid access key"));
  }
};

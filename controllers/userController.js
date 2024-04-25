/** @format */

const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const Post = require("../models/Post");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;
exports.followUnfollowUser = async (req, res) => {
  try {
    const { userIdTofollow } = req.body;
    const currUserId = req._id;
    const userToFollow = await User.findById(userIdTofollow);
    console.log("Ye rha user to follow", userToFollow);
    const currUser = await User.findById(currUserId);
    if (userIdTofollow === currUserId) {
      return res.send(error(409, "user cant follow himself"));
    }
    if (!userToFollow) {
      return res.send(error(404, "user to follow not found"));
    }
    console.log(currUser.followings.includes(userIdTofollow));
    if (currUser.followings.includes(userIdTofollow)) {
      const index = currUser.followings.indexOf(userIdTofollow);
      currUser.followings.splice(index, 1);
      const index2 = userToFollow.followers.indexOf(currUserId);
      userToFollow.followers.splice(index2, 1);

      console.log("user---->", currUser);
    } else {
      currUser.followings.push(userIdTofollow);
      userToFollow.followers.push(currUserId);
      await userToFollow.save();
      await currUser.save();
      console.log("user---->", currUser);
    }
    await userToFollow.save();
    await currUser.save();
    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

exports.getPostsOfFollowing = async (req, res) => {
  try {
    const currUserId = req._id;
    const currUser = await User.findById(currUserId).populate("followings");
    console.log(currUser);
    const fullPosts = await Post.find({
      owner: {
        $in: currUser.followings,
      },
    }).populate("owner");
    console.log("full posts delho", fullPosts);
    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    console.log("post dekho", posts);
    const followingsIds = currUser.followings.map((item) => item._id);
    followingsIds.push(req._id);
    const suggestions = await User.find({
      _id: {
        $nin: followingsIds,
      },
    });
    console.log(suggestions);
    return res.send(success(200, { ...currUser._doc, suggestions, posts }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};
exports.deleteMyProfile = async (req, res) => {
  try {
    const currUserId = req._id;
    const currUser = await User.findById(currUserId);
    //delete all posts
    await Post.deleteMany({ owner: currUserId });
    //removed myself from followers followings
    currUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.followings.indexOf(currUserId);
      follower.followings.splice(index, 1);
      await follower.save();
    });
    //remove myself from my folloings followers
    currUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(currUserId);
      following.followers.splice(index, 1);
      await following.save();
    });
    const allPosts = await Post.find();
    allPosts.forEach(async (post) => {
      const index = post.likes.indexOf(currUserId);
      post.likes.splice(index, 1);
      await post.save();
    });
    await currUser.deleteOne();
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(500, "user deleted"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
exports.getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
exports.updateProfileController = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;
    console.log(name);
    console.log(bio);
    const userId = req._id;
    const currUser = await User.findById(userId);
    if (!currUser) {
      return res.send(404, "User not found");
    }
    if (name) {
      currUser.name = name;
    }
    if (bio) {
      currUser.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "SocialMedia",
      });
      console.log(cloudImg);
      currUser.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }
    console.log("uppdidivdo", currUser);

    await currUser.save();
    return res.send(success(200, { currUser }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });
    const fullPosts = user.posts;
    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    //user._doc contains relevant info of schema and not irrelevant stuff
    return res.send(success(200, { ...user._doc, posts }));
  } catch (e) {}
};

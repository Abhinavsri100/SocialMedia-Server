/** @format */

const { success, error } = require("../utils/responseWrapper");
const Post = require("../models/Post");
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;
exports.createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;

    if (!caption || !postImg) {
      return res.send(error(400, "Caption and postImg are required"));
    }
    const cloudImg = await cloudinary.uploader.upload(postImg, {
      folder: "postImg",
    });

    const owner = req._id;

    const user = await User.findById(req._id);

    const post = await Post.create({
      owner,
      caption,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.url,
      },
    });

    user.posts.push(post._id);
    await user.save();

    console.log("user", user);
    console.log("post", post);

    return res.json(success(200, { post }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// check
exports.likeUnlikeController = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.send(error(404, "post id required"));
    }
    // console.log("postId", postId);
    const post = await Post.findById(postId).populate("owner");
    // console.log("post --->", post);
    const currUserId = req._id;
    if (!post) {
      return res.send(error(404), "Post not found");
    }
    console.log("done");
    console.log("postId", post.likes.includes(currUserId));
    if (post.likes.includes(currUserId)) {
      console.log("Before index");
      const index = post.likes.indexOf(currUserId);
      console.log(index);
      post.likes.splice(index, 1);
    } else {
      post.likes.push(currUserId);
    }
    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
exports.updatePostController = async (req, res) => {
  try {
    const { currPostId, caption } = req.body;
    const currUserId = req._id;
    const currUser = await User.findById(currUserId);
    console.log(currUser.posts.includes(currPostId));
    const currPost = await Post.findById(currPostId);
    console.log("current-->", currPost);
    if (!currPost) {
      return res.send(error(404, "post not found"));
    }

    if (currPost.owner.toString() !== currUserId) {
      return res.send(error(409, "User cant update others posts"));
    }
    if (caption) {
      currPost.caption = caption;
    }

    await currPost.save();
    return res.send(success(200, { currPost }));
  } catch (e) {
    return res.send(error(500, "Cannot update the post"));
  }
};
exports.deletePostController = async (req, res) => {
  try {
    console.log("Hello1");
    const currUserId = req._id;
    const { currPostId } = req.body;
    console.log("Hello1");
    const currUser = await User.findById(currUserId);
    console.log(currUser);
    const currPost = await Post.findById(currPostId);
    console.log(currPost);
    if (!currPost) {
      return res.send(error(404, "post not found"));
    }
    // console.log(currPost.owner.toString());
    // console.log(currUserId);
    if (currPost.owner.toString() !== currUserId) {
      return res.send(error(404, "User can delete only his post"));
    }
    console.log("Hello1");
    const index = currUser.posts.indexOf(currPostId);
    console.log(index);
    currUser.posts.splice(index, 1);
    await currUser.save();
    console.log(currUser);

    const updatedPosts = await Post.findByIdAndDelete({ _id: currPostId });
    console.log("Hello1");
    return res.send(success(200, "post deleted successfully"));
  } catch (e) {
    return res.send(error(500, "post cannot be deleted successfully"));
  }
};

exports.getMyPostsController = async (req, res) => {
  try {
    const currUserId = req._id;
    const currUser = await User.findById(currUserId);
    if (!currUser) {
      return res.send(error(404, "user do not exist"));
    }
    const userPosts = await Post.find({ owner: { $in: currUser } }).populate(
      "likes"
    );
    if (!userPosts) {
      return res.send(error(404, "You havent created any post"));
    }
    return res.send(success(200, { userPosts }));
  } catch (e) {
    return res.send(error(500, "Failed to get the post"));
  }
};
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.send(error(404, "user Id not found"));
    }
    const post = await Post.find({ owner: userId }).populate("likes");
    if (!post) {
      return res.send(error(404, "no posts found"));
    }
    return res.send(success(200, { post }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

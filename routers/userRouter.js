/** @format */

const { requireUser } = require("../middlewares/requireUser");
const UserController = require("../controllers/userController");
const router = require("express").Router();
router.post("/follow", requireUser, UserController.followUnfollowUser);
router.get("/getFeedData", requireUser, UserController.getPostsOfFollowing);
router.delete("/delete", requireUser, UserController.deleteMyProfile);
router.get("/getMyProfile", requireUser, UserController.getMyInfo);
router.put("/", requireUser, UserController.updateProfileController);
router.post("/getUserProfile", requireUser, UserController.getUserProfile);
module.exports = router;

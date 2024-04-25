/** @format */

const router = require("express").Router();
const { requireUser } = require("../middlewares/requireUser");
const postsController = require("../controllers/postsController");

router.post("/", requireUser, postsController.createPostController);
router.post("/like", requireUser, postsController.likeUnlikeController);
router.put("/", requireUser, postsController.updatePostController);
router.post("/delete", requireUser, postsController.deletePostController);
router.get("/getMyPosts", requireUser, postsController.getMyPostsController);
router.get("/getUserPosts", requireUser, postsController.getUserPosts);

module.exports = router;
//we have to check post whwether we can create post or not

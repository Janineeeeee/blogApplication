const express = require("express");
const postController = require("../controllers/post");
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

const router = express.Router();

router.post('/addPost', verify, postController.addPost);

router.get('/getAllPost', postController.getAllPost);

router.get('/getOwnPost', verify, postController.getOwnPost);

router.patch('/updatePost/:postId', verify, postController.updatePost);

router.delete('/deletePost/:postId', verify, postController.deletePost);

router.post('/addComment/:postId', verify, postController.addComment);

router.get('/viewComments/:postId', verify, postController.viewComments);

router.delete('/removeComment/:postId/:commentId', verify, postController.removeComment);

module.exports = router;


const express = require('express');
const feedController = require('../controllers/feed');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post',isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], feedController.createPost);

router.get('/post/:postId',isAuth, feedController.getSinglepost)

router.put('/post/:postId',isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], feedController.getEditPost);

router.delete('/post/:postId', isAuth,feedController.deletePost);

module.exports = router;
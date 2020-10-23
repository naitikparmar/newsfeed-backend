const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
//const { default: image } = require('../../newsfeed/src/components/Image/Image');

const fs = require("fs");
const path = require("path");

//const post = require('../models/post');

exports.getPosts = (req, res, next) => {
  const currentpage = req.query.page || 1;
  console.log(currentpage);
  const perpageitem = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentpage - 1) * perpageitem)
        .limit(perpageitem);
    })
    .then((posts) => {
      //   console.log(posts)
      res.status(200).json({
        message: "Data is fetched..",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // res.status(200).json({
  //   posts: [{
  //     _id: '1',
  //     title: 'First Post',
  //     content: 'This is the first post!',
  //     imageUrl: 'images/duck.png',
  //     creator: {
  //       name: 'Naitik'
  //     },
  //     createdAt: new Date()
  //   }
  //   ]
  // });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;
  console.log(req.userId);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed , input valid data !");
    error.statusCode = 422;
    throw error;
  }
  // Create post in db
  if (!req.file) {
    const error = new Error("NO Image is found !");
    error.statusCode = 422;
    throw error;
  }
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  post
    .save()
    .then((resultdata) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      if(!user){
        return console.log('nOsue found')
      }
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created Successfully !",
        post: post,
        creator: {
          id: creator._id,
          name: creator.name,
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSinglepost = (req, res, next) => {
  const postId = req.params.postId;
  // console.log(postId)
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("NO data found !!");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Post fetched...",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getEditPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed..");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("no file picked...");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No data Found");
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((resultdata) => {
      res.status(200).json({
        message: "data is updated ..!",
        post: resultdata,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  // console.log(postId)
  Post.findById(postId, req.userId)
    .then((post) => {
      if (!post) {
        const error = new Error("no data found ");
        error.statusCode = 422;
        throw error;
      }
      //check authenticate user created this post or not
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      res.status(200).json({
        message: "Post deleted sucessfully",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filepath) => {
  filepth = path.join(__dirname, "..", filepath);
  fs.unlink(filepath, (err) => {
    console.log(err);
  });
};

const express = require('express');
const {body} = require('express-validator');
const authContoller = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.put('/signup',[
    body('email').isEmail().withMessage('Please enter valid emailid ')
    .custom((value,{req})=>{
        return User.findOne({email:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('Email is already exists')
            }
        })
    }).normalizeEmail(),
    body('name').isLength({min : 5}).trim(),
    body('password').isAlphanumeric().isLength({min:5})    
],authContoller.getSignup);

router.post('/login',authContoller.getSignin);

module.exports = router
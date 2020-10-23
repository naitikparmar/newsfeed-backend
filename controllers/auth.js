const User = require('../models/user');
const { validationResult } = require('express-validator')
const bcypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

exports.getSignup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw error
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcypt.hash(password, 8)
        .then(hashedpassword => {
            const user = User({
                email: email,
                name: name,
                password: hashedpassword
            })
            return user.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'Signup sucess..',
                userId: result._id
            })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.getSignin = (req, res, next) =>{
    const email = req.body.email;
    const password  = req.body.password;
    let loadUser ;
    User.findOne({email:email})
    .then(user =>{
        if(!user){
            const error = new Error('No User Found with this email');
            error.statusCode = 401;
            throw error;
        }
        loadUser = user;
        return bcypt.compare(password,user.password)
    })
    .then(isMatched =>{
        if(!isMatched){
            const error = new Error('Enter Password is wrong')
            error.statusCode = 401;
            throw error;
        }
       const token = jwt.sign({
           email:loadUser.email,
           userId: loadUser._id.toString()
        },'secretkey',{expiresIn:'1h'})
        res.status(200).json({
            token:token,
            userId:loadUser._id.toString()
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    })
}
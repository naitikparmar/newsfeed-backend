const express = require('express');
const bodyParser = require('body-parser');
const db = require('./utils/database');
const feedRoutes = require('./routes/feed');
const authRoute = require('./routes/auth');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const app = express();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
});
const fileFilter = (req,file,cb)=>{
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'){
            cb(null,true)
        }else{
            cb(null,false)
        }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(multer({storage:storage,fileFilter:fileFilter}).single('image'))
app.use('/images',express.static(path.join(__dirname,'images')))

app.use((error, req, res, next)=>{
    console.log(error);
    const status  = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        message:message
    })
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth',authRoute);

db().then(()=>{
    app.listen(8080);
    console.log('server is running!!');
}).catch(err=>{
    console.log(err);
})
const mongoose = require('mongoose');

//const MONGOOSE_URI = 'mongodb://127.0.0.1:27017/newsfeed'

const connect = () => {
  return new Promise(resolve => {
        try {
            mongoose.connect('mongodb+srv://naitik:naitik123@cluster0-6wc7i.mongodb.net/newsfeed', {
                useUnifiedTopology: true,
                useNewUrlParser: true
            },
                (err => {
                    if (!err) {
                        console.log('connected succesfuly')
                        resolve()
                    }else{
                        process.exit(1)
                    }
                })
            )
        } catch (error) {
            console.log(error)
        }
    })
}

module.exports = connect
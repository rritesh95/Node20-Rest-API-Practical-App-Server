const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

const app = express();

// app.use(bodyParser.urlencoded()); //appropriate for content-type = 'x-www-from-urlencoded' <form>
app.use(bodyParser.json()); //appropriate for content-type= "application/json"
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter}).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images'))); //define static paths

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    //'*' indicates it will allow all the domains, we can specify list in real-world
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    // Second argument specifies the HTTP methods allowed
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Second argument specifies the headers allowed in request, added "authorization"
    //to allow consumer to sent authorization information
    next();
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data

    res.status(status).json({
        message: message,
        data: data
    });
});

mongoose.connect(
    'mongodb://MongoDB_User:MongoDBUser%40210791@node-complete-shard-00-00.0vl9o.mongodb.net:27017,node-complete-shard-00-01.0vl9o.mongodb.net:27017,node-complete-shard-00-02.0vl9o.mongodb.net:27017/messages?ssl=true&replicaSet=atlas-13wbgl-shard-0&authSource=admin&retryWrites=true&w=majority'
)
.then(result => {
    console.log('Connected!');
    const server = app.listen(8080);

    const io = require('./socket').init(server);
    io.on('connection', socket => {
        console.log("Client connected!");
    });
})
.catch(err => console.log(err));
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
// const fs = require('fs')
// const https = require('https')

const mongoose = require('mongoose')
// const mongoDB = 'mongodb://127.0.0.1/xpoesy_database' //testing localhost
const mongoDB = 'mongodb+srv://Xpoesy-Test:xpoesy@cluster0.olahs.mongodb.net/test1?retryWrites=true&w=majority' //testing mongo cluster


mongoose.connect(mongoDB, {useNewUrlParser : true, useUnifiedTopology : true}).then(() => {
    console.log('Connected mongodb')
})

const db = mongoose.connection

// db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// const privateKey = fs.readFileSync('./key.pem', 'utf8');
// const certificate = fs.readFileSync('./cert.pem', 'utf8');
// const ca = fs.readFileSync('./csr.pem', 'utf8');

// const credentials = {
//     key: privateKey,
//     cert: certificate,
//     // ca: ca
// };
// const httpsServer = https.createServer(credentials, app);

app.use(cors({
    // origin: 'http://localhost:8080',
    origin: 'https://summer-math-5999.on.fleek.co',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
    credentials: true
}));
//https://summer-math-5999.on.fleek.co

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Origin", "https://sendgrid.api-docs.io");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, On-behalf-of, x-sg-elas-acl");
//     next();
// })

const user = require('./routes/user');
const gameroom = require('./routes/gameroom');

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user', user);
app.use('/game', gameroom);

const port = process.env.PORT || 3001;//443

app.listen(port, () => {
    console.log("The server is running on Port " + port)
});
// httpsServer.listen(port, () => {
//     console.log("The server is running on Port " + port)
// });
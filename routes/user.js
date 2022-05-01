
const express = require('express')
const router  = express.Router()
const User = require('../models/user')
const GameRoom = require('../models/gameroom')

var nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');
const secretkey = '#secret';




const dotenv = require("dotenv");
dotenv.config()
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// signin
router.post('/signin/:username/:password', (req, res) => {
    const {username, password} = req.params;
    let payload = {
        username: username
    };

    if(username == "1234" && password == "angell1385"){ // in case of user is super admin
        payload = {...payload, ...{ level: 'super'}};
        jwt.sign(payload, secretkey, { expiresIn: 86400}, (err, token) => {
            
            if(err)
                return res.json({ message: err });
            res.json({success: 'super', token: token});
        });
        
    }else{
        User.findOne({username: username, password: password}, (error, response) => {
            if(response) { // in case of the user is admin
                payload = {...payload, level: 'admin'}
                jwt.sign(payload, secretkey, { expiresIn: 86400 }, (err, token) => {
                    if(err)
                        return res.json({ message: err})
                    res.json({success: 'admin', token: token});
                });
            } else { // in case of the user is player
                const code = password.substring(0, 4);
                const number = parseInt(password.substring(4, 6));
                if(number < 8 && number > 0) { // is number 1-7?
                    GameRoom.findOne({ code: code }, (error, response) => {
                        if(response) {
                            // player signs into game room
                            if(!response.isStarted) {
                                var players = response.players;
                                let filter = players.filter(player => {
                                    return player.get('code') + '' == password + '';
                                });
                                // console.log(response)
                                if(filter.length == 0) {
                                    players.push({ username: username, code: password, isPay: false, voted: ['', '', ''], order: 10 });
                                    payload = {...payload, ...{level: 'player', code: password}};
                                    GameRoom.findOneAndUpdate({ code: password.substring(0, 4) }, {
                                        players: players
                                    }, (error, response) => {
                                        jwt.sign(payload, secretkey, { expiresIn: 86400 }, (err, token) => {
                                            if(err)
                                                return res.json({ message: err})
                                            res.json({success: 'player', token: token});
                                        });
                                    });
                                    
                                } else {
                                    res.json({success: 'invalid'});
                                }
                            } else {
                                res.json({success: 'started', })
                            }
                        }
                        else {
                            res.json({success: 'invalid'});
                        }
                    });                    
                } else {
                    res.json({success: 'invalid'});
                }
                
            }
        })
    }


});

const master_email = 'support@social-media-builder.com';
const master_password = '1234567890Aa@';

//sign up
router.post('/signup/:metausername/:username/:password/:email/:referredby', (req, res) => {

    const {metausername, username, password, email, referredby} = req.params;

    var transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 587,
        secure : false,
        auth: {
            // user: 'pokerplayers@mail.com',
            // pass: 'krWRcRXcbNjp'
            user: master_email,
            pass: master_password
        }
    });
      
    var mailOptions = {
        from: 'pokerplayers@mail.com',
        to: email,
        subject: 'Support',
        text: 'Welcome to app.social-media-builder.com'
    };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.json({success: false})
        } else {
          console.log('Email sent: ' + info.response);
          res.json({success: true})
        }
      });

    
    
    
    // const msg = {
    //   to: 'sagedragon915@gmail.com', // Change to your recipient
    //   from: email, // Change to your verified sender
    //   subject: 'Play to earn game',
    //   text: `${metausername} ${username} ${referredby} ${password}`,
    // }
    
    // sgMail
    //   .send(msg)
    //   .then((response) => {
    //     console.log(response[0].statusCode)
    //     console.log(response[0].headers)
    //   })
    //   .catch((error) => {
    //     console.error(error.response.body.errors)
    //   })    

    
})

//create admin
router.post('/:metausername/:username/:password/:email/:referredby', (req, res) => {

    const {metausername, username, password, email, referredby} = req.params;

    User.findOne({username: username}, (error, response) => {
        if(response){
            res.json({success: false})
        } else {
            User.create(
                {
                    metausername: metausername, 
                    username: username, 
                    password: password, 
                    email: email,
                    referredby: referredby
                }).then((user) => {
                res.json({success: true, user: user});
            })
        }
    });
})

// update admin
router.put('/:id/:metausername/:username/:password/:email/:referredby', (req, res) => {

    const {id, metausername, username, password, email, referredby} = req.params;

    User.findOneAndUpdate({id : id}, 
        {
            metausername: metausername, 
            username: username, 
            password: password, 
            email: email,
            referredby: referredby
        },
        (error, response) => {
            if(response){
                res.json({success: true, user: response});
            } else {
                res.json({success: false});
            }
        }
    );
});

//delete admin
router.delete('/:id', (req, res) => {
    const {id} = req.params;

    User.findByIdAndRemove(id, (err, response) => {
        res.json(response);
    });
})

//get all data of admins
router.get('/', (req, res) => {
    User.find((error, response) => {
        res.json(response);
    })
})

// use is valid
const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];
    console.log(token)
    if(token) {
        jwt.verify(token, secretkey, (err, decoded) => {
            if(err) 
                return res.json(
                {
                    isLoggedIn: false,
                    message: "Failed To Authenticate"
                })
            req.user = {};
            req.user.username = decoded.username;
            req.user.level = decoded.level;
            if(decoded.code)
                req.user.code = decoded.code;
            next()  
        });
    } else {
        res.json({ message: "Incorrect Token Given", isLoggedIn: false });
    }
}

router.get('/valid', verifyJWT, (req, res) => {
    res.json({isLoggedIn: true, user: req.user});
})

module.exports = router
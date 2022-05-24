const express = require('express')
const router  = express.Router()
const GameRoom = require('../models/gameroom')

//admin creates the game room

router.post('/create/:data', (req, res) => {
    GameRoom.create(JSON.parse(req.params.data), (error, response) => {
        if(response)
        {
            const { username, amount, code } = JSON.parse(req.params.data);
            let players = [];
            players.push({ username: username, code: code + "00", isPay: false });
            GameRoom.findOneAndUpdate({ code: code }, {
                players: players
            }, (error, response) => {
                
                res.json({success: true, gamedata: response});
            });
            
        } else {
            return res.json({success: false})
        }
        
    });
});

//confirm payment

router.post('/pay/:code/:address', (req, res) => {
    const {code, address} = req.params;
    GameRoom.findOne({code: code.substring(0, 4)}, (error, response) => {
        if(response) {
            let players = response.players;
            let index = players.findIndex(player => {
                if(player)
                    return player.get('code') == code;
            });
            let temp_player = players.find(player => {
                if(player)
                    return player.get('code') == code;
            });


            players.splice(index, 1, {username: temp_player.get('username'), code: code, isPay: true, voted: ['', '', ''], order: 0, address: address});
            // else {
            //     res.json({success: false});
            //     return;
            // }
            GameRoom.findOneAndUpdate({ code: code.substring(0, 4) }, {
                players: players
            }, (error, response) => {
                if(response)
                    {                         
                        console.log(response)                                              
                        res.json({success: true});
                    }
                else
                    res.json({success: false}); 
            });
        } else {
            res.json({success: false});
        }
    });
})

// get code by username

router.get('/getcode/:username',  (req, res) => {
    const {username} = req.params;
    GameRoom.findOne({username: username}, null, {sort: {_id: -1}}, (error, response) => {
        if(response){
            
            res.json(response);
        }
    })
});

// get amount by code 

router.get('/getinfo/:code', (req, res) => {
    const { code } = req.params;

    GameRoom.findOne({ code: code}, (error, response) => {
        if(response) {
            res.json(response);
        }
    });
})

// get player infor by code

router.get('/getplayers/:code', (req, res) => {
    const {code} = req.params;
    GameRoom.findOne({ code: code }, null, { sort: { _id: -1 }}, (error, response) => {
        if(response) {
            let players = response.players;
            let top = players.filter(player => {
                if(player)
                    return player.get('order') == 1;
            });
            if(top.length == 1)
            {
                
                GameRoom.findOneAndUpdate({ code : code }, { isEnded : true, players : players }, (e, r) => {
                    
                });
            }
            res.json(response)
        }
    });
    
})

// set the start game flag

router.post('/start/:code/:username', (req, res) => {
    const { code, username } = req.params;

    GameRoom.findOneAndUpdate({ code: code, username: username }, { isStarted: true}, (error, response) => {
        if(response) {
            res.json({success: true});
        } else {
            res.json({success: false});
        }
    })
});

// vote

router.post('/vote/:data', (req, res) => {
    const { code, players } = JSON.parse(req.params.data);
    GameRoom.findOneAndUpdate({code: code}, {players: players}, (error, response) => {
        
        if(response)
            res.json({success: true});
        else 
            res.json({success: false});
    });
})




module.exports = router;
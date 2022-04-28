const mongoose = require('mongoose')
const Schema = mongoose.Schema

// const PlayerSchema = new Schema({
//     username: {type: String, default: ''},
//     no: {type: Number, default: 1}
// });

const GameRoomSchema = new Schema({
    username : {type : String, default:''},
    amount: { type: Number, default: 0},
    code: {type: String, default: '0000'},
    players: { type: [Map], default: [] },
    isStarted: { type: Boolean, default: false },
    isEnded: { type: Boolean, default: false } 
}, {timestamps: true})

module.exports = mongoose.model('gameroom', GameRoomSchema);
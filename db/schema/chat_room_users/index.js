const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chat_room_userSchema = new Schema({

    room_id : 
    {
        type : Number,
        required : true
    },
    role_id : 
    {
        type : Number,
        required : true
    },
    user_id : 
    {
        type : Number,
        required : true
    },
    created_by:{
        type : Number,
        required : true
    },
    created_at:{
        type: Date,
        required: true,
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('chat_room_users',chat_room_userSchema);


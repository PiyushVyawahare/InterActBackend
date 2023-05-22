const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chat_roomSchema = new Schema({

    name : 
    {
        type : String,
        required : true
    },
    description : 
    {
        type : String,
        required : false
    },
    room_image : 
    {
        type : String,
        required : false,
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

module.exports = mongoose.model('chat_room',chat_roomSchema);


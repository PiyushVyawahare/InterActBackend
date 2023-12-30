const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message : {
        type : String,
        required : true
    },
    room_id : {
        type : String,
        required : true
    },
    created_by : {
        type : String,
        required : false
    },
    created_at: {
        type: Date,
        required: true,
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('message',messageSchema);
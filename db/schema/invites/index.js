const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invitesSchema = new Schema({

    room_id : 
    {
        type : Number,
        required : true
    },
    user_id :
    {
        type : Number,
        required : true
    },
    message : {
        type : String,
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

module.exports = mongoose.model('invites',invitesSchema);


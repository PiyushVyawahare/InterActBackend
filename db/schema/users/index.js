const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_name : {
        type : String,
        required : true
    },

    password : {
        type : String,
        required : true
    },

    email :{
        type : String,
        required : true
    },
    
    profile_picture :{
        type : String,
        required : false
    },

    birth_date: {
        type: Date,
        required: false,
    },

    mobile: {
        type: String,
        required: true,
    },

    is_verified: {
        type: Boolean,
        default: false,
        required: true,
    },
},
{
    timestamps : true
});

module.exports = mongoose.model('user',userSchema);
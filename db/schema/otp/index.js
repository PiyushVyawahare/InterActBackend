const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    user_id : {
        type : String,
        required : true
    },
    otp : {
        type: String,
        required: true
    },
    expiry: {
        type: Number,
        required: true,
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('otp',otpSchema);
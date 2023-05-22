const express = require("express");
const bcrypt = require('bcrypt');

const saltRounds = 10;
const router = express.Router();
const Users = require("../db/schema/users");
const { duplicate } = require('../utils/responseMessages');
const users = require("../db/schema/users");
const responseMessages = require("../utils/responseMessages");
const emailService = require('../services/emailService');
const emailTemplate = require('../utils/emailTemplate');
const otpGenerator = require('otp-generator');
const OTP = require('../db/schema/otp');

router.post('/',async (req, res) => {
    
    const user_details = req.body;
    const is_duplicate = await users.findOne({
        $or:[ {'user_name': user_details.user_name }, { 'mobile': user_details.mobile }, { 'email': user_details.email } ]
    });

    if (is_duplicate) {
        let duplicate_value = 'Username';
        if ( is_duplicate.mobile === user_details.mobile ) duplicate_value = 'Phone number';
        if ( is_duplicate.email === user_details.email ) duplicate_value = 'Email';
        return res.status(400).json({ error: duplicate(duplicate_value) });
    }

    if ( user_details.photo ) {

    }

    const hashed_password = await bcrypt.hash(user_details.password, saltRounds);
    user_details.is_verified = 0;
    user_details.password = hashed_password;
    
    const user_response = await users.create(user_details);

    if ( !user_response || !user_response?._id ) {
        return res.status(500).json({ error: responseMessages.internal_server });
    }

    const title = 'InterAct: Verification Mail';
    const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true, specialChars: true });
    const template = await emailTemplate(otp);

    
    await OTP.findOneAndUpdate(
        { user_id: user_response._id },
        { $set: { user_id: user_response._id, otp: otp, expiry: (new Date()).getTime() + 600000 } },
        { upsert: true, new: true }
    );
    await emailService(user_details.email, title, template );

    return res.status(200).send({ message: 'Email was sent to your registered email' });
})

module.exports = router;
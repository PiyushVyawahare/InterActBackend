const express = require("express");
const bcrypt = require('bcrypt');

const saltRounds = 10;
const router = express.Router();
// const Users = require("../db/schema/users");
const { duplicate } = require('../utils/responseMessages');
const users = require("../db/schema/users");
const responseMessages = require("../utils/responseMessages");
const emailService = require('../services/emailService');
const emailTemplate = require('../utils/emailTemplate');
const otpGenerator = require('otp-generator');
const OTP = require('../db/schema/otp');

const jwt = require('jsonwebtoken');
const aws = require('../services/awsService')
const fs = require('fs')
require('dotenv').config();

router.post('/',async (req, res) => {
    
    const user_details = req.body;
    // console.log(process.env.AWS_ACCESS_KEY);
    const is_duplicate = await users.findOne({
        $or:[ {'user_name': user_details.user_name }, { 'mobile': user_details.mobile }, { 'email': user_details.email } ]
      });
      
    const title = 'InterAct: Verification Mail';
    console.log(is_duplicate)
    if (is_duplicate) {
      if(is_duplicate.is_verified) return res.status(400).send({ message: 'User Already registered with us...' });
      else {
        const flag1 = generateAndMailOTP(user_details, title);
        if(flag1) return res.status(200).send({ message: 'Email sent to your registered email' });
      }
    }

    if ( user_details.profile_picture ) {
      // const base64 = fs.readFileSync("path-to-image.jpg", "base64");
      const buffer = Buffer.from(user_details.profile_picture, "base64");
      const data = await aws.uploadToS3(user_details.user_name+"_profilePicture", buffer);
      if(data) user_details.profile_picture = user_details.user_name+"_profilePicture";
      // console.log(data);
    }

    const hashed_password = await bcrypt.hash(user_details.password, saltRounds);
    // user_details.is_verified = 0;
    user_details.password = hashed_password;
    
    const user_response = await users.create(user_details);

    if ( !user_response || !user_response?._id ) {
        return res.status(500).json({ error: responseMessages.internal_server });
    }

    
    const flag = generateAndMailOTP(user_response, title);
    if(flag) return res.status(200).send({ message: 'Email was sent to your registered email' });
    return res.status(400).send({ message: "Something went wrong!" })
})


const generateAndMailOTP = async (user_details, title) =>{
  const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true, specialChars: true });
  const hashed_otp = await bcrypt.hash(otp, saltRounds);
  const template = await emailTemplate(otp);

    
  const flag = await OTP.findOneAndUpdate(
      { user_id: user_details._id },
      { $set: { user_id: user_details._id, otp: hashed_otp, expiry: (new Date()).getTime() + 600000 } },
      { upsert: true, new: true }
  );
  const flag1 = await emailService(user_details.email, title, template );
  if(flag1 && flag?._id) return true;
  return false;
}




router.get("/verify", async(req, res) => {
  const otp_details = req.body;

  if(!otp_details){
    return res.status(500).json({ error: responseMessages.internal_server });
  }

  const otp = await OTP.findOne({user_id: otp_details.user_id});
  if(!otp || !otp._id){
    return res.status(500).json({ error: responseMessages.internal_server });
  }

  if(otp.expiry.getTime() < (new Date()).getTime()){
    return res.status(400).send({message: "OTP expired!!"});
  }

  const isMatched = await bcrypt.compare(otp_details.otp, otp.otp);
  if(isMatched){
    await OTP.deleteMany({user_id: otp_details.user_id})
    await users.updateOne({_id: otp_details.user_id}, {$set : { is_verified: true}})
    return 
  }
  return res.status(200).send({ message: 'Email verified successfully!' });
});


router.post("/signin", async (req, res) => {
  const data = req.body;
  if(!data){
     return res.status(500).json({ error: errorMessages.internal_server })
  }
  const newToken = {
    id: "",
    user_name: "",
    expiry: "",
  };
  if(data.user_name){
    const user_details = await users.findOne({user_name: data.user_name});
    if(!user_details) return res.status(404).send({ message: "User doesn't exist1!" });
  
    if(!user_details.is_verified) return res.status(404).send({ message: 'To sign in, please verify your email first.'});
  
    const flag = await bcrypt.compare(data.password, user_details.password);

    if(!flag) return res.status(404).send({ message: "User doesn't exist!" });
    newToken.id= user_details._id;
    newToken.user_name= user_details.user_name;
    const date = new Date();
    newToken.expiry = new Date(date.getTime() + 10*60000);
  }
  else if(data.token){
    const token1 = jwt.verify(data.token, "shhhh");
    if((new Date(token1.expiry)).getTime() < (new Date()).getTime()){
      return res.status(400).send({ message: "Session Expired!!" });
    }
    newToken.id = token1.id;
    newToken.user_name = token1.user_name;
    const date = new Date();
    newToken.expiry = new Date(date.getTime() + 10*60000);
  }
  else{
    return res.status(500).json({ error: responseMessages.internal_server });
  }

  const token = jwt.sign(newToken, 'shhhh');

  res.status(200).json({token: token, data: {id: newToken.id, user_name: newToken.user_name}});
})



router.get("/profile", async(req, res) => {
  // const blob = await aws.dowloadFileFromS3('piyushbv12');
  // fs.writeFileSync('first.jpg', blob, "base64");
  const url = await aws.getPreSignedUrl('piyush1234_profilePicture');
  console.log(url);
  res.status(200).send({ message: 'profile downloaded' })
})


module.exports = router;
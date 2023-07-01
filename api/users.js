const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const users = require("../db/schema/users");
const responseMessages = require("../utils/responseMessages");
const emailService = require('../services/emailService');
const emailTemplate = require('../utils/emailTemplate');
const otpGenerator = require('otp-generator');
const OTP = require('../db/schema/otp');
const jwt = require('jsonwebtoken');
const aws = require('../services/awsService');
require('dotenv').config();

const saltRounds = 10;

router.post('/', async (req, res) => {

  const user_details = req.body;

  const is_duplicate = await users.findOne({
    $or: [{ 'user_name': user_details.user_name }, { 'mobile': user_details.mobile }, { 'email': user_details.email }]
  });

  const title = 'InterAct: Verification Mail';
  if (is_duplicate) {
    if (is_duplicate.is_verified) return res.status(400).send({ message: 'User Already registered with us...' });
    else {
      const flag1 = generateAndMailOTP(is_duplicate, title);
      if (flag1) return res.status(200).send({ message: 'You are already registered. Please verify your email... OTP sent to your registered email' });
    }
  }

  if (user_details.profile_picture) {
    const buffer = Buffer.from(user_details.profile_picture, "base64");
    const data = await aws.uploadToS3(user_details.user_name + "_profilePicture", buffer);
    if (data) user_details.profile_picture = user_details.user_name + "_profilePicture";
  }

  const hashed_password = await bcrypt.hash(user_details.password, saltRounds);
  user_details.password = hashed_password;

  const user_response = await users.create(user_details);

  if (!user_response || !user_response?._id) {
    return res.status(500).json({ error: responseMessages.internal_server });
  }


  const flag = generateAndMailOTP(user_response, title);
  if (flag) return res.status(200).send({ message: 'Email was sent to your registered email' });
  return res.status(400).send({ message: "Something went wrong!" })
})


const generateAndMailOTP = async (user_details, title) => {
  const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true, specialChars: true });
  const hashed_otp = await bcrypt.hash(otp, saltRounds);
  const template = await emailTemplate(otp);

  const var1 = new Date();
  const expiry = new Date(var1.getTime() + 10 * 60000);

  const flag = await OTP.findOneAndUpdate(
    { user_id: user_details._id },
    { $set: { user_id: user_details._id, otp: hashed_otp, expiry: expiry } },
    { upsert: true, new: true }
  );
  const flag1 = await emailService(user_details.email, title, template);
  if (flag1 && flag?._id) return true;
  return false;
}

router.post("/verify", async (req, res) => {
  const otp_details = req.body;

  if (!otp_details) {
    return res.status(500).json({ error: responseMessages.internal_server });
  }
  const user_details = await users.findOne({ email: otp_details.email });
  if (!user_details || !user_details._id) {
    return res.status(400).send({ message: "User not found!" });
  }
  const otp = await OTP.findOne({ user_id: user_details._id });
  if (!otp || !otp._id) {
    return res.status(400).send({ message: "User not found or email is already verified." });
  }

  if ((new Date(otp.expiry)).getTime() < (new Date()).getTime()) {
    return res.status(400).send({ message: "OTP expired!!" });
  }

  const isMatched = await bcrypt.compare(otp_details.otp, otp.otp);
  if (isMatched) {
    await OTP.deleteMany({ user_id: otp.user_id })
    await users.updateOne({ _id: otp.user_id }, { $set: { is_verified: true } })
    return res.status(200).send({ message: 'Email verified successfully!' });
  }
  return res.status(400).send({ message: "Couldn't verify user, please enter valid OTP" })
});

router.post("/signin", async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.status(400).send({ message: "Data not received!" });
  }
  if (!data.email || !data.password) {
    return res.status(400).send({ message: "Data not received properly." })
  }

  const user_details = await users.findOne({ email: data.email });
  if (!user_details) return res.status(404).send({ message: "User doesn't exist1!" });

  if (!user_details.is_verified) return res.status(404).send({ message: 'To sign in, please verify your email first.' });

  const flag = await bcrypt.compare(data.password, user_details.password);

  if (!flag) return res.status(404).send({ message: "User doesn't exist!" });
  const id = user_details._id;
  const user_name = user_details.user_name;
  const expiry = (new Date()).getTime() + 10 * 60000;
  const photo = await aws.getPreSignedUrl(user_details.profile_picture);

  if (!photo) {
    res.status(404).send({ message: "Some unexpected thing happened." });
  }
  const newToken = {
    id: id,
    user_name: user_name,
    expiry: expiry,
    photo: photo
  };

  const token = jwt.sign(newToken, process.env.JWT_KEY);

  res.status(200).json({ token: token, data: newToken });
})

module.exports = router;
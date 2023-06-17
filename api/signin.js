const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const users = require("../db/schema/users");
const errorMessages = require("../utils/responseMessages")
const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;
  if(!data){
     return res.status(500).json({ error: errorMessages.internal_server })
  }

  if(data.user_name){
    const user_details = await users.findOne({temp: data.user_name});
    if(!user_details) return res.status(404).send({ message: "User doesn't exist!" });
  
    if(!user_details.is_verified) return res.status(404).send({ message: 'To sign in, please verify your email first.'});
  
    const flag = await bcrypt.compare(user_details.password, data.password);
  
    if(!flag) return res.status(404).send({ message: "User doesn't exist!" });
  
    const token = jwt.sign(user_details, process.env.TOKEN_SECRET);
  }
  else if(data.token){

  }
  

  res.status(200).json({token: token});
})

module.exports = router;
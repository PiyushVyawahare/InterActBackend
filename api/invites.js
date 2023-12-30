const express = require("express");
const bcrypt = require("bcrypt");
const responseMessages = require("../utils/responseMessages");
const emailService = require("../services/emailService");
const emailTemplate = require("../utils/emailTemplate");
const otpGenerator = require("otp-generator");
const OTP = require("../db/schema/otp");
const jwt = require("jsonwebtoken");
const aws = require("../services/awsService");
require("dotenv").config();

const users = require("../db/schema/users");
const invites = require("../db/schema/invites");
const rooms = require("../db/schema/chat_rooms");
const chat_room_users = require("../db/schema/chat_room_users");
const roles = require("../db/schema/roles");

const router = express.Router();

/**
 * _id
 * room name
 * invitation_id
 * room image
 * message
 */

router.get("/", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  const token_details = jwt.verify(token, process.env.JWT_KEY);

  // console.log(token_details.id);
  const invitations = await invites.find({ user_id: token_details.id });

  if (!invitations && !invitations?.length) {
    return res.status(400).send({ message: "No invites found" });
  }

  const all_room_ids = invitations.map((invitation) => {
    return invitation.room_id;
  });

  const room_details = await rooms.find({ _id: all_room_ids });

  if (!room_details && !room_details?.length) {
    return res.status(400).send({ message: "No room found" });
  }

  const all_room_details = [];
  // console.log(room_details);

  for (const room of room_details) {
    const image = await aws.getPreSignedUrl(room.room_image);
    all_room_details.push({
      room_id: room._id,
      room_name: room.name,
      room_image: image,
      invitation_id: invitations.find(
        (invitation) => invitation.room_id == room._id
      )._id,
      message: invitations.find((invitation) => invitation.room_id == room._id)
        .message,
    });
  }

  return res.status(200).send(all_room_details);
});

router.post("/accept/:id", async (req, res) => {
  // console.log(req);
  const token = req.headers.authorization.split(" ")[1];

  const token_details = jwt.verify(token, process.env.JWT_KEY);

  const invitation_id = req.params.id;

  const invitation = await invites.findOne({
    user_id: token_details.id,
    _id: invitation_id,
  });

  if (!invitation) {
    return res.status(400).send({ message: "Invitation invalid" });
  }

  const memeber = await roles.findOne({ name: "Member" });

  console.log(memeber);
  const chat_room_users_details = {
    room_id: invitation.room_id,
    role_id: memeber._id,
    user_id: token_details.id,
    created_by: invitation.created_by,
    created_at: new Date(),
  };

  chat_room_users.create(chat_room_users_details);

  if (!chat_room_users_details)
    return res.status(400).send({ message: "Invitation invalid" });

  const deleteResposne = await invites.deleteOne({ _id: invitation_id });

  if (!deleteResposne)
    return res.status(400).send({ message: "Invitation invalid" });

  res.status(200).send({ message: "Invitation accepted successfully" });
});

router.post("/reject/:id", async (req, res) => {
  // console.log(req);
  const token = req.headers.authorization.split(" ")[1];

  const token_details = jwt.verify(token, process.env.JWT_KEY);

  const invitation_id = req.params.id;

  const invitation = await invites.findOne({
    user_id: token_details.id,
    _id: invitation_id,
  });

  if (!invitation) {
    return res.status(400).send({ message: "Invitation invalid" });
  }

  const deleteInvite = await invites.deleteOne({ _id: invitation_id });

  if (!deleteInvite)
    return res.status(400).send({ message: "Invitation invalid" });

  res.status(200).send({ message: "Invitation rejected successfully" });
});

module.exports = router;

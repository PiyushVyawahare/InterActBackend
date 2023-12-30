const express = require("express");
const jwt = require("jsonwebtoken");
const responseMessages = require("../utils/responseMessages");
const bcrypt = require("bcrypt");
const aws = require("../services/awsService");
require("dotenv").config();

const users = require("../db/schema/users");
const rooms = require("../db/schema/chat_rooms");
const invites = require("../db/schema/invites");
const chat_room_users = require("../db/schema/chat_room_users");
const roles = require("../db/schema/roles");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newRoom_details = req.body;
    const token = req.headers.authorization.split(" ")[1];
    // console.log(newRoom_details);
    // console.log(req.headers, token);
    const token_details = jwt.verify(token, process.env.JWT_KEY);

    const user = await users.findOne({ _id: token_details.id });

    if (!user?._id) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    if (newRoom_details.room_image) {
      const base64_string = newRoom_details.room_image;
      const required_string = base64_string.split(",")[1];
      const buffer = Buffer.from(required_string, "base64");
      const key =
        "/rooms/" +
        newRoom_details.name +
        "_room_image" +
        Math.random().toString();

      const data = await aws.uploadToS3(key, buffer);

      if (data) newRoom_details.room_image = key;
    }

    const date1 = Date.now();

    const room = await rooms.create({
      name: newRoom_details.name,
      description: newRoom_details.description,
      room_image: newRoom_details.room_image,
      created_by: user._id,
      created_at: date1,
    });

    if (!room?._id) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    const admin = await roles.findOne({ name: "Admin" });
    console.log(admin);

    const chat_room_admin = await chat_room_users.create({
      room_id: room._id,
      role_id: admin._id,
      user_id: user._id,
      created_by: user.user_name,
      created_at: new Date(),
    });

    if (!chat_room_admin) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    const room_members = newRoom_details.users;

    const members = [];
    room_members.forEach((member) => {
      // const ifUser = await users.findOne({_id: member._id});
      members.push({
        room_id: room._id,
        user_id: member._id,
        message:
          "" +
          user.user_name +
          " has invited you to join room " +
          room.name +
          ", Please Join!",
        created_by: user._id,
        created_at: Date.now(),
      });
    });
    const sent_invite = await invites.insertMany(members);
    console.log(sent_invite);
    if (!sent_invite) {
      return res.status(500).send({ message: "Error occured!" });
    }

    return res.status(200).send({ message: "Room created Successfully!!" });
  } catch (error) {
    console.log("Error occured in create room, Error:", error);
  }
});

router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    // console.log(req.headers, token);
    console.log(req);
    const token_details = jwt.verify(token, process.env.JWT_KEY);

    const user = await users.findOne({ _id: token_details.id });

    if (!user?._id) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    const all_rooms_details = await chat_room_users.find(
      { user_id: user._id },
      { room_id: 1 }
    );

    if (!all_rooms_details || !all_rooms_details.length) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    const all_rooms = await rooms.find({
      _id: all_rooms_details.map((r) => r.room_id),
    });

    if (!all_rooms || !all_rooms.length) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    for (const room of all_rooms) {
      const image = await aws.getPreSignedUrl(room.room_image);
      room.room_image = image;
    }

    res.status(200).send(all_rooms);
  } catch (error) {
    console.log("Error occured in get all Rooms, Error:", error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // console.log(newRoom_details);
    // console.log(req.headers, token);
    const token_details = jwt.verify(token, process.env.JWT_KEY);

    const user = await users.findOne({ _id: token_details.id });

    if (!user?._id) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    const room_id = req.params.id;

    const room_details = await rooms.findOne({ _id: room_id });

    if (!room_details) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    room_details.room_image = await aws.getPreSignedUrl(
      room_details.room_image
    );

    res.status(200).send(room_details);
  } catch (error) {
    console.log("Error occured in get particular room details, Error:", error);
  }
});

router.get("/:id/messages", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const token_details = jwt.verify(token, process.env.JWT_KEY);

    const user = await users.findOne({ _id: token_details.id });

    if (!user?._id) {
      return res.status(500).json({ error: responseMessages.internal_server });
    }

    const room_id = req.params.id;

    const messages = await messages.find({ room_id: room_id });

    res.status(200).send(messages);
  } catch (error) {
    console.log("Error occured in get particular room details, Error:", error);
  }
});

// router.get("/invites", async (req, res) => {
//   const room_id = req.query.data;
//   const invitesForThisRoom = await invites.find({ created_by: room_id });
//   console.log(invitesForThisRoom);
//   return res.status(200).send(invitesForThisRoom);
// });

module.exports = router;

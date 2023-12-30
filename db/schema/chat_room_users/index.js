const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chat_room_userSchema = new Schema(
  {
    room_id: {
      type: String,
      required: true,
    },
    role_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("chat_room_users", chat_room_userSchema);

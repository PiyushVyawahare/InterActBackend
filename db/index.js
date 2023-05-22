module.exports = {
    init: () => {
        const mongoose = require('mongoose');
        const username  = "TeamMessaging";
        mongoose.connect(`mongodb+srv://${username}:1234567890@cluster0.ohogkgr.mongodb.net/?retryWrites=true&w=majority`)
        .then(function(){
            console.log("db is live");
        })
        .catch(function(err){
            console.log(err);
            console.log("Internal Server Error");
        })
    },

    getAllTable: () => {
        return {
            users: require('./schema/users'),
            roles: require('./schema/roles'),
            messages: require('./schema/messages'),
            invites: require('./schema/invites'),
            chat_rooms: require('./schema/chat_rooms'),
            chat_room_users: require('./schema/chat_room_users'),
        }
    }
}
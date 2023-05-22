const mailjet = require("node-mailjet").connect(
    "55ce27b8d2ea2fbd4edd948f42423fe6",
    "0d5edbeb160c0a6cec0203605aeac170"
);

module.exports = (email,title,html) => {
    return mailjet.post("send", {'version': 'v3.1'})
    .request({
        "Messages":[
            {
            "From": {
                "Email": "pittyvarun21@gmail.com",
                "Name": "InterAct"
            },
            "To": [
                {
                "Email": email,
                "Name": ""
                }
            ],
            "Subject": title,
            "TextPart": "",
            "HTMLPart": html,
            }
        ]
        })
}


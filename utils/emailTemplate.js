const fs = require("fs");
const path = require("path");
const awsService = require("../services/awsService");

module.exports = async (verificationOtp, user_name) => {
  const src_temp = await awsService.getPreSignedUrl("INTER.png");
  console.log(src_temp);
  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Email Verification</title>
            <style>
              .container {
                width: 95%;
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                color: black;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                border: solid black 1px;
                border-radius: 10px;
              }
              
              h1 {
                color: #dcedf7;
                font-size: 24px;
                margin: 0;
                padding: 0;
              }
              
              p {
                margin: 10px 0;
                padding: 0;
              }
              .verification-otp {
                color: #F1F6F9;
                background-color: #212A3E;
                display: inline-block;
                padding: 6px 12px;
                border-radius: 4px;
                margin-left: 15px;
                font-size: 18px;
              }

            </style>
        </head>
        <body>
            <div class="container">
                <div style="background-color: #212A3E; border-radius:10px 10px 0 0; padding: 10px;">
                    <img src='${src_temp}' alt="file" height=50 />
                    <h3 style="padding: 10px; margin: 0; color: #ffffff; display: inline;text-align:right;float:right;">Email Verification</h3>
                </div>
                <div style="padding: 20px">
                  <p>Dear ${user_name},</p>
                  <p>Thank you for joining InterAct! Please use the following verification otp to complete your registration:</p>
                  <p style="text-align: start !important; padding:10px 5% 10px 5%; background-color: #dcedf7; border-radius: 10px; text-align: center">
                    <strong>Verification OTP:</strong> 
                    <span style="color: #F1F6F9;
                    background-color: #212A3E;
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 4px;
                    margin-left: 15px;
                    font-size: 18px;">${verificationOtp}</span>
                  </p>
                  <p>The above otp will be valid for only 10 minutes </p>
                  <p>Best regards, <br> Team InterAct</p>
                </div>
            </div>
        </body>
        </html>
    `;

  return html;
};

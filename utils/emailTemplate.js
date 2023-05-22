const fs = require('fs');
const path = require('path');
const awsService = require('../services/awsService');

module.exports = async (verificationOtp) => {

    const src_temp = await awsService.getPreSignedUrl('INTER.png');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Email Verification</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #212A3E;
                }
                
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #212A3E;
                    padding: 20px;
                    color: #F1F6F9;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.5;
                }
                
                h1 {
                    color: #F1F6F9;
                    font-size: 24px;
                    margin: 0;
                    padding: 0;
                }
                
                p {
                    margin: 10px 0;
                    padding: 0;
                }
                .verification-otp {
                    background-color: #F1F6F9;
                    color: #212A3E;
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 18px;
                    margin-top: 10px;
                }

            </style>
        </head>
        <body>
            <div class="container">
                <div style="display: flex; align-items: center;">
                    <img src="${src_temp}" alt="Image" style="min-width: 30%; height: 40px;">
                    <h1 style="margin-left: 10px">  :  Email Verification</h1> 
                </div>
                <p>Dear User,</p>
                <p>Thank you for joining InterAct! Please use the following verification otp to complete your registration:</p>
                <p><strong>Verification OTP:</strong> <span class= 'verification-otp'>${verificationOtp}</span></p>
                <p>The above otp will be valid for only 10 minutes </p>
                <p>Best regards,</p>
                <p>The InterAct Team</p>
            </div>
        </body>
        </html>
    `;
    
    return html;
}

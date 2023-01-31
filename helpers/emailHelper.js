"use strict";
const nodemailer = require("nodemailer");
module.exports = { sendEmail }
let fs = require('fs')

async function sendEmail(order_id, client_email_id) {
    const Email = process.env.Email
    const password = process.env.EmailPassword
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: Email, // generated ethereal user
                pass: password, // generated ethereal password
            },
            
        })

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'shopkart.express@gmail.com', // sender address
            to: client_email_id, // list of receivers
            subject: "Invoice ✔", // Subject line
            text: "order placed?", // plain text body
            html: "<b>Order Placed</b>", // html body
            attachments: [
                {   
                filename: 'invoice.pdf',
                path: `./Invoice/${order_id}.pdf` // stream this file
                },
            ]
        });
        fs.unlink(`./Invoice/${order_id}.pdf`, (err) => {
            if (err) throw err;
          });
    }
    catch (error) {
        console.log("\x1b[31m%s\x1b[0m", 'Faild to send email to client! :\n', error);
    }

}





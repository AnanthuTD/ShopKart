"use strict";
const nodemailer = require("nodemailer");
module.exports = { sendEmail }
let fs = require('fs')

async function sendEmail(order_id) {
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'shopkart.express@gmail.com', // generated ethereal user
                pass: "cvrjtzuywtbrlavy", // generated ethereal password
            },
            
        })

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'shopkart.express@gmail.com', // sender address
            to: "ananthutd2021@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
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





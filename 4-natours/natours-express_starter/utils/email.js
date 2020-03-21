// requires nodemailer
const nodemailer = require('nodemailer');

/*
const sendEmailG = options => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME_G,
      pass: process.env.EMAIL_PASSWORD_G
    }
    // activate in gmail; "less secure app" option

  });
  */

const sendEmail = async options => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // activate in gmail; "less secure app" option
  });

  // define the email options
  const mailOptions = {
    from: 'Lalama Yatawara <lalama@yatawara.io',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

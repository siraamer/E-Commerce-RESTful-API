const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //! 1) Create transporter like ('gmail')
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //! 2) Define email options ('from', 'to', 'subject', 'content')
  const mailOptions = {
    from: 'E-shop App <nodecycle28gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  //! 3) Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

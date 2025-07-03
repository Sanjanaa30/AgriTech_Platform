const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sanjanas2811@gmail.com',
    pass: 'wdtk nbup jpnz tpwx' // Use app password if using Gmail
  }
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: 'sanjanas2811@gmail.com',
    to,
    subject: 'Your OTP for AgriTech Platform',
    html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendOtpEmail;

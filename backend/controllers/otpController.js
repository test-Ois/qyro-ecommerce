const transporter = require("../utils/emailTransporter");

const otpStore = {};

exports.sendOtp = async (req, res) => {

  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = otp;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`
  });

  res.json({ message: "OTP sent successfully" });

};

exports.verifyOtp = (req, res) => {

  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    return res.json({ message: "OTP verified" });
  }

  res.status(400).json({ message: "Invalid OTP" });
};
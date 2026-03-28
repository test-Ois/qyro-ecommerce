const transporter = require("./emailTransporter");

const sendEmail = async (email, subject, message) => {

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: message
    });

    console.log("Email sent successfully");

  } catch (error) {

    console.log("Email sending failed:", error);

  }

};

module.exports = sendEmail;
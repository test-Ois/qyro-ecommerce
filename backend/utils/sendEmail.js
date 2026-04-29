const transporter = require("./emailTransporter");
const logger = require("./logger");

const sendEmail = async (email, subject, message) => {

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: message
    });

    logger.info("Email sent successfully", { email, subject });

  } catch (error) {

    logger.error("Email sending failed", { email, subject, error: error.message });

  }

};

module.exports = sendEmail;

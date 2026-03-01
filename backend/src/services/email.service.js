require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(to, name) {
  const subject = "Welcome to Backend-Ledger!";
  const text = `Hello ${name},\n\nWelcome to Backend-Ledger Enthusiast! We're excited to have you join our community.\n\nBest regards,\nBackend-Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Welcome to Backend-Ledger! We're excited to have you join our community.</p><p>Best regards,<br>Backend-Ledger Team</p>`;
  await sendEmail(to, subject, text, html);
}

async function sendTransactionConfirmationEmail(fromEmail, toEmail, amount) {
  const subject = "Transaction Confirmation";
  const text = `A transaction of INR ${amount} has been successfully completed between accounts.\n\nBest regards,\nBackend-Ledger Team`;
  const html = `<h2>Transaction Successful</h2><p>A transaction of <b>INR ${amount}</b> has been completed between accounts.</p><p>Best regards,<br>Backend-Ledger Team</p>`;

  // Send to both parties
  await sendEmail(fromEmail, subject, text, html);
  await sendEmail(toEmail, subject, text, html);
}

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendTransactionConfirmationEmail,
};

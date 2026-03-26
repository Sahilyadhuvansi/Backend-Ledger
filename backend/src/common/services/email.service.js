// ─── Commit: Environment Configuration ───
// What this does: Loads secret keys (Email, Password) from the .env file.
require("dotenv").config();
const nodemailer = require("nodemailer");

// ─── Commit: SMTP Transporter Setup (OAuth vs Password) ───
// What this does: Configures how the server logs into the Gmail server.
// Why it exists: Google normally blocks simple passwords. We support either an "App Password" (EMAIL_PASS) or the more secure "OAuth2" (Client ID/Tokens).
// Interview insight: OAuth2 is the industry standard because it doesn't give the server your real Gmail password.
const transporterConfig = process.env.EMAIL_PASS
  ? {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }
  : {
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    };

const transporter = nodemailer.createTransport(transporterConfig);

// ─── Commit: Server-Side Connection Test ───
// What this does: Pings the email server as soon as the app starts to see if the credentials are correct.
transporter.verify((error, _success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// ─── Commit: Unified SendEmail Function ───
// What this does: A reusable helper to send any type of email (Text or HTML).
// Patterns used: "Generic abstraction".
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger AI" <${process.env.EMAIL_USER}>`,
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

// ─── Commit: Registration Welcome Template ───
// What this does: Sends a "Hello" email when someone signs up.
// Interview insight: This should ideally be "Triggered" by an Event (like 'user_registered') for better architecture.
async function sendRegistrationEmail(to, name) {
  const subject = "Welcome to Backend-Ledger!";
  const text = `Hello ${name},\n\nWelcome to Backend-Ledger Enthusiast! We're excited to have you join our community.\n\nBest regards,\nBackend-Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Welcome to <b>Backend-Ledger</b>! We're excited to have you join our AI-driven banking community.</p><p>Best regards,<br>Backend-Ledger Team</p>`;
  await sendEmail(to, subject, text, html);
}

// ─── Commit: Transaction Alert Template ───
// What this does: Alerts both the Sender and Recipient when money moves.
// Why INR? We have localized the app for the Indian market.
async function sendTransactionConfirmationEmail(fromEmail, toEmail, amount) {
  const subject = "Transaction Confirmation";
  const text = `A transaction of ₹${amount} has been successfully completed between accounts.\n\nBest regards,\nBackend-Ledger Team`;
  const html = `<h2>Transaction Successful</h2><p>A transaction of <b>₹${amount}</b> has been completed between accounts.</p><p>Best regards,<br>Backend-Ledger Team</p>`;

  // Security & Transparency: Alert both parties
  await sendEmail(fromEmail, subject, text, html);
  await sendEmail(toEmail, subject, text, html);

  // ─── Commit: Admin Monitoring (Debug Loop) ───
  // What this does: Sends a "Spy" copy to the admin account.
  // Why it exists: Useful for developers to see if the email service is working in production without having to check the logs.
  if (
    fromEmail !== process.env.EMAIL_USER &&
    toEmail !== process.env.EMAIL_USER
  ) {
    await sendEmail(
      process.env.EMAIL_USER,
      "🛡️ Admin Copy: " + subject,
      text,
      html,
    );
  }
}

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendTransactionConfirmationEmail,
};

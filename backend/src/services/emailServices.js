
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  return transporter.sendMail({
    from: `"Plant Pathology" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Reset Your Plant Pathology Password",
    text: `You requested a password reset. Open this link to set a new password: ${resetUrl}. This link expires in 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:550px;margin:auto;padding:30px;color:#294936;">
        <h2 style="color:#194b31;">Plant Pathology</h2>
        <h3>Password Reset Request</h3>
        <p>We received a request to reset your account password.</p>
        <p>Click the button below to choose a new password.</p>
        <a href="${resetUrl}"
          style="display:inline-block;padding:13px 22px;background:#194b31;color:white;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
        <p style="margin-top:25px;">This link expires in 15 minutes and can only be used once.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };

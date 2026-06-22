import nodemailer from "nodemailer";
import { config } from "../configs/validateEnv.js";

// Create transporter using Gmail SMTP
export const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: Number(config.EMAIL_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

// Send verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.BASE_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Academix: Course Management Platform" <${config.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to Course Management Platform! 🎓</h2>
        <p style="color: #555;">Thank you for registering. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #888; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">This link will expire in 1 hour.</p>
        <hr style="border: 1px solid #eee;" />
        <p style="color: #aaa; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${email}`);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

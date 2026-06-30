import { google } from "googleapis";
import { config } from "../configs/validateEnv.js";

// Configure OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
  config.GMAIL_CLIENT_ID,
  config.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

oAuth2Client.setCredentials({
  refresh_token: config.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.BASE_URL}/api/auth/verify-email?token=${token}`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">Welcome to Academix! 🎓</h2>
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
  `;

  const emailLines = [
    `From: ${config.GMAIL_USER}`,
    `To: ${email}`,
    `Subject: Verify Your Email Address`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    emailContent,
  ];
  const rawEmail = emailLines.join("\r\n");

  const encodedMessage = Buffer.from(rawEmail)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });
    console.log(`✅ Verification email sent to ${email}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Gmail API send failed:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

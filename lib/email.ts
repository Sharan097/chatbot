import nodemailer from "nodemailer";
import crypto from "crypto";

/**
 * Generate secure email verification token
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Send verification email via SMTP
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string
): Promise<void> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify?token=${token}`;

  // Development fallback (log to console if SMTP not configured)
  if (
    process.env.NODE_ENV === "development" &&
    (!process.env.SMTP_USER || !process.env.SMTP_PASS)
  ) {
    console.log("\n⚠️  SMTP not configured - EMAIL LOGGED TO CONSOLE");
    console.log("========================================");
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your Email - AI Card Generator`);
    console.log(`\nClick this link to verify your email:\n${verificationUrl}`);
    console.log(`\nThis link expires in 10 minutes.`);
    console.log("========================================\n");
    return;
  }

  // Configure SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: false,
    debug: false,
  });

  // Email content
  const mailOptions = {
    from: `"AI Card Generator" <${process.env.EMAIL_FROM || "noreply@aicardgenerator.com"}>`,
    to: email,
    subject: "Verify Your Email - AI Card Generator",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AI Card Generator</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 16px 0; font-size: 22px;">Welcome${name ? `, ${name}` : ""}! 👋</h2>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Thank you for signing up for AI Card Generator. We're excited to have you on board!
              </p>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                To complete your registration and start creating amazing AI-powered cards, please verify your email address:
              </p>

              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 24px 0 16px 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              
              <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; word-break: break-all;">
                <p style="color: #667eea; font-size: 14px; margin: 0;">${verificationUrl}</p>
              </div>

              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  <strong> Important:</strong> This verification link expires in 10 minutes for security reasons.
                </p>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0;">
                If you didn't create an account with AI Card Generator, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 24px 30px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #6c757d; font-size: 13px; margin: 0 0 8px 0;">
                © 2025 AI Card Generator. All rights reserved.
              </p>
              <p style="color: #6c757d; font-size: 13px; margin: 0;">
                Transform your ideas into beautiful cards with AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Welcome${name ? ` ${name}` : ""} to AI Card Generator!

Thank you for signing up. Please verify your email address to complete your registration.

Verification Link:
${verificationUrl}

This link expires in 10 minutes.

If you didn't create this account, you can safely ignore this email.

© 2025 AI Card Generator
    `,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    console.error("Fallback verification link:", verificationUrl);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Send password reset email (for future implementation)
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  name?: string
): Promise<void> => {
  // Future implementation
  return Promise.resolve();
};

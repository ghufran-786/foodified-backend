const nodemailer = require("nodemailer");

// Check if we're in demo/test mode
const isDemoMode = process.env.EMAIL_USER === "your-email@gmail.com" || 
                   process.env.EMAIL_USER === "demo" ||
                   !process.env.EMAIL_USER;

let transporter;

if (!isDemoMode) {
  // Configure your email service here (Gmail, SendGrid, etc.)
  transporter = nodemailer.createTransport({
    // For Gmail:
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
    
    // For other services, use:
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASSWORD
    // }
  });
} else {
  // Demo/Test mode - logs emails instead of sending
  console.log("⚠️  DEMO MODE: Emails will be logged to console instead of sent");
  console.log("ℹ️  To enable real email, update EMAIL_USER and EMAIL_PASSWORD in .env");
  
  transporter = {
    sendMail: async (options) => {
      console.log("\n📧 ========== EMAIL (DEMO MODE) ==========");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`From: ${options.from}`);
      console.log("\nContent:");
      console.log(options.html);
      console.log("========== END EMAIL ==========\n");
      return { messageId: "demo-" + Date.now() };
    }
  };
}

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: isDemoMode ? "noreply@foodiewebsite.com" : (process.env.EMAIL_USER || "noreply@foodiewebsite.com"),
      to: email,
      subject: "Password Reset - Foodie Website",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p>
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>Foodie Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    if (isDemoMode) {
      console.log("✅ Email logged to console (DEMO MODE)");
      return { success: true, message: "Password reset link generated (check console). In production, email would be sent." };
    } else {
      console.log("✅ Email sent successfully");
      return { success: true, message: "Email sent successfully" };
    }
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return { success: false, message: "Failed to send email" };
  }
};

module.exports = { sendPasswordResetEmail, isDemoMode };

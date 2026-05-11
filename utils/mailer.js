import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, message) {
  const msg = {
    to,
    from: process.env.SENDER_EMAIL,
    subject,
    html: message,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent successfully to:", to);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Error sending email:", {
      to,
      from: process.env.SENDER_EMAIL,
      errorCode: error.code,
      errorMessage: error.message,
      errorResponse: error.response?.body,
      fullError: error
    });
    return { 
      success: false, 
      message: error.message,
      code: error.code,
      details: error.response?.body
    };
  }
}

// Diagnostic function to test email service
export async function testEmailService() {
  console.log("🔍 Testing SendGrid configuration...");
  
  // Check environment variables
  const apiKey = process.env.SENDGRID_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;

  const diagnostics = {
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    senderEmailConfigured: !!senderEmail,
    senderEmail: senderEmail,
    nodeEnv: process.env.NODE_ENV
  };

  // Try to send a test email
  try {
    const testMsg = {
      to: senderEmail,
      from: senderEmail,
      subject: "SendGrid Test Email",
      html: `<h2>SendGrid Configuration Test</h2><p>If you received this, your email service is working!</p><p>Time: ${new Date().toISOString()}</p>`
    };

    console.log("📧 Attempting to send test email...");
    await sgMail.send(testMsg);
    
    diagnostics.emailSendTest = {
      success: true,
      message: "Test email sent successfully"
    };
    console.log("✅ Test email sent successfully!");
  } catch (error) {
    diagnostics.emailSendTest = {
      success: false,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.response?.body
    };
    console.error("❌ Test email failed:", error.response?.body || error.message);
  }

  return diagnostics;
}

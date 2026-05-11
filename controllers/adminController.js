import db from "../database/database.js";
import { sendEmail } from "../utils/mailer.js";

export const approveOrganizer = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Get pending user
    const [results] = await db.query(
      "SELECT firstname, email FROM user WHERE user_id = ? AND status = 'Pending'",
      [user_id]
    );

    if (results.length === 0)
      return res.status(404).json({ msg: "Pending user not found" });

    const user = results[0];

    // Update status and role
    await db.query(
      `UPDATE user
       SET status = 'Active', role_id = 2
       WHERE user_id = ?`,
      [user_id]
    );

    // Send approval email
    try {
      const emailResult = await sendEmail(
        user.email,
        "Your Organizer Application is Approved!",
        `<h1>Hi ${user.firstname}!</h1>
         <p>Congratulations! Your application to become an Organizer has been approved.</p>
         <p>You now have full access to Organizer features.</p>`
      );
      
      if (emailResult.success) {
        console.log("✅ Approval email sent to:", user.email);
      } else {
        console.warn("⚠️ Approval email failed:", emailResult);
      }
    } catch (err) {
      console.error("❌ Failed to send approval email:", err);
    }

    return res.json({ msg: "User approved and notified successfully." });
  } catch (err) {
    console.error("Admin approval error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

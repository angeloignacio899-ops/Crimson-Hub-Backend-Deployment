import db from "../database/database.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "uploads/profiles";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    if (!req.user || !req.user.id) {
      return cb(new Error("User not found for file upload"));
    }
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Only JPEG and PNG files are allowed");
      error.code = "LIMIT_FILE_TYPES";
      return cb(error, false);
    }
    cb(null, true);
  },
});

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [results] = await db.query("SELECT * FROM user WHERE user_id = ?", [userId]);

    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    res.json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      birthday: user.birthday || "",
      gender: user.gender || "",
      student_id: user.student_id || "",
      department: user.department || "",
      year_level: user.year_level || "",
      course: user.course || "",
      phone: user.phone || "",
      profile_image: user.profile_image || null,
      created_at: user.created_at ? user.created_at.toISOString() : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", err });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firstname,
      lastname,
      birthday,
      gender,
      email,
      student_id,
      department,
      year_level,
      course,
      phone,
      currentPassword,
      newPassword,
    } = req.body;

    // Get existing user
    const [results] = await db.query(
      "SELECT * FROM user WHERE user_id = ?",
      [userId]
    );

    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];

    let hashedPassword = user.password;

    // ✔ Handle password change
    if (newPassword) {
      if (!currentPassword)
        return res
          .status(400)
          .json({ message: "Current password is required" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // ✔ Handle profile image
    let profileImagePath = user.profile_image;

    if (req.file) {
      profileImagePath = `/uploads/profiles/${req.file.filename}`;
    }

    // ✔ Update Query
    await db.query(
      `
      UPDATE user SET
        firstname=?, lastname=?, birthday=?, gender=?, email=?, 
        student_id=?, department=?, year_level=?, course=?, phone=?, 
        password=?, profile_image=?
      WHERE user_id=?
    `,
      [
        firstname || user.firstname,
        lastname || user.lastname,
        birthday || user.birthday,
        gender || user.gender,
        email || user.email,
        student_id || user.student_id,
        department || user.department,
        year_level || user.year_level,
        course || user.course,
        phone || user.phone,
        hashedPassword,
        profileImagePath,
        userId,
      ]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile_image: profileImagePath,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM user");
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM user WHERE user_id = ?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};

// Update user (admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, department, role_id, status } = req.body;

    const [result] = await db.query(
      `UPDATE user SET firstname=?, lastname=?, email=?, department=?, role_id=?, status=? WHERE user_id=?`,
      [firstname, lastname, email, department, role_id, status, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const countActiveUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS activeUsers FROM user WHERE status = 'active'"
    );
    res.json({ activeUsers: rows[0].activeUsers });
  } catch (err) {
    console.error("Error fetching active user count:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const approveOrganizer = async (req, res) => {
  const { id } = req.params;

  await db.query(`
    UPDATE user
    SET role_id = 2, status = 'active'
    WHERE user_id = ?
  `, [id]);

  res.json({ msg: "Organizer approved successfully!" });
};




import express from "express";
import { getUserProfile, updateUserProfile, upload } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getAllUsers, deleteUser, updateUser, countActiveUsers, approveOrganizer } from "../controllers/userController.js";
const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, upload.single("profileImage"), updateUserProfile);
router.get("/", verifyToken ,getAllUsers);
router.delete("/:id", verifyToken, deleteUser);
router.put("/update/:id", verifyToken, updateUser);
router.get("/count-active", verifyToken, countActiveUsers);
router.patch("/approve-organizer/:id", approveOrganizer);


export default router;

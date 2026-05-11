import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads/events"));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg", "image/png", 
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    cb(null, allowed.includes(file.mimetype));
};

export default multer({
    storage: storage,   // ✅ FIXED
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

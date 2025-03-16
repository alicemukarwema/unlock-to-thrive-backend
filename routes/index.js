import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// Controllers
import register from "../controllers/register.js";
import signin from "../controllers/signin.js";
import { requestPasswordReset, resetPassword } from "../controllers/resetPassword.js";
import { 
    getProfile,
    updateProfile, 
    changePassword, 
    deleteAccount 
} from "../controllers/users.js";

// Middleware
import auth from "../middleware/auth.js";

const router = express.Router();

// Middleware
router.use(cookieParser());
router.use(bodyParser.json());

// Auth routes
router.post("/register", register);
router.post("/signin", signin);
router.post("/request-reset-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

// User routes (protected)
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/change-password", auth, changePassword);
router.delete("/account", auth, deleteAccount);

export default router;

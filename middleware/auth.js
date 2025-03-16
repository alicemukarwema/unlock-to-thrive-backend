import jwt from "jsonwebtoken";
import User from "../models/register.js";

const auth = async (req, res, next) => {
    try {
        // Get token from header or cookies
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "Authentication required. Please log in." });
        }

        // Verify token
        const decoded = jwt.verify(token, "teckcode");
        
        // Find user by id
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        return res.status(401).json({
            message: "Invalid or expired token",
            error: error.message
        });
    }
};

export default auth;
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/register.js";


dotenv.config(); // Load environment variables

const SECRET_KEY ="teckcode"; // Fallback default key

const auth = async (req, res, next) => {
    try {
        // Get token from headers or cookies
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
console.log("token",token)
        if (!token) {
            return res.status(401).json({ message: "Authentication required. Please log in." });
        }

        // Verify token using secret key
        const decoded = jwt.verify(token, SECRET_KEY);

        // Find the user in the database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({
            message: "Invalid or expired token",
            error: error.message
        });
    }
};

export default auth;

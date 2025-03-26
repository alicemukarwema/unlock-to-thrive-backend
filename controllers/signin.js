import SignUp from "../models/register.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 

const signInController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const check = await SignUp.findOne({ email });
    if (!check) {
      console.log("Response status: 404 - User not found");
      return res.status(404).json({ message: "User not found. Please sign up." });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, check.password);
    if (!isPasswordValid) {
      console.log("Response status: 401 - Incorrect password");
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Ensure accountType exists
    const accountType = check.accountType || "user"; // Default to 'user' if undefined

    // Generate JWT token
    const token = jwt.sign({ id: check._id, accountType }, "teckcode", { expiresIn: "3d" });

    const user = {
      id: check._id,
      accountType,
      email: check.email,
      token,
    };

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
    };

    console.log("Response status: 200 - Login successful");

    // Send response with token in a cookie
    return res.status(200).cookie("token", token, options).json({
      message: "Login successful",
      id: check._id, 
      accountType, 
      token,
      user,
    });
  } catch (err) {
    console.error("Response status: 500 - Server error:", err);
    return res.status(500).json({
      message: "Failed to process the data",
      error: err.message,
    });
  }
};


export default signInController;

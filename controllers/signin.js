import SignUp from "../models/register.js";
import signIn from "../models/signin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signInController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const check = await SignUp.findOne({ email });
    if (!check) {
      return res.status(404).json({ message: "User not found. Please sign up." });
    }

    const isPasswordValid = await bcrypt.compare(password, check.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: check._id }, "teckcode", { expiresIn: "3d" });

    const user = {
      email: check.email,
      token,
    };

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
    };

    // Send response with token in a cookie
    return res.status(200).cookie("token", token, options).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.log("Error caught:", err);
    return res.status(500).json({
      message: "Failed to process the data",
      error: err.message,
    });
  }
};

export default signInController;

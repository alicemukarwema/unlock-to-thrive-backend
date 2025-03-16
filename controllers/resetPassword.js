import User from "../models/register.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Request password reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Set token and expiration (1 hour from now)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        await user.save();

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME || 'munyeshurimanzi@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'sshp qtgs kuub udvk'
            }
        });

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Email message
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USERNAME || 'your-email@gmail.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) requested a password reset for your account.\n\n
                   Please click on the following link, or paste it into your browser to complete the process:\n\n
                   ${resetUrl}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Password reset email sent",
            resetToken
        });

    } catch (error) {
        console.log("Request password reset error:", error);
        return res.status(500).json({
            message: "Failed to process password reset request",
            error: error.message
        });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // Find user by token and check if token is still valid
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Password reset token is invalid or has expired"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update user password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password has been reset successfully"
        });

    } catch (error) {
        console.log("Reset password error:", error);
        return res.status(500).json({
            message: "Failed to reset password",
            error: error.message
        });
    }
};
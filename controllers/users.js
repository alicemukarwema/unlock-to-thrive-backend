import User from "../models/register.js";
import bcrypt from "bcrypt";

// Get user profile
export const getProfile = async (req, res) => {
    try {
       
        const user = req.user;
        
        const userProfile = user.toObject();
        delete userProfile.password;
        delete userProfile.resetPasswordToken;
        delete userProfile.resetPasswordExpires;

        return res.status(200).json({
            message: "User profile retrieved successfully",
            data: userProfile
        });
    } catch (error) {
        console.log("Get profile error:", error);
        return res.status(500).json({
            message: "Failed to get user profile",
            error: error.message
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;
        
        // Fields that cannot be updated
        const restrictedFields = ['password', 'email', 'accountType', 'resetPasswordToken', 'resetPasswordExpires'];
        
        // Remove restricted fields from updates
        restrictedFields.forEach(field => delete updates[field]);
        
        // Handle specific field validations based on account type
        if (req.user.accountType === 'student' && updates.education) {
            const validEducation = ['high_school', 'undergraduate', 'graduate', 'other'];
            if (!validEducation.includes(updates.education)) {
                return res.status(400).json({
                    message: "Invalid education value"
                });
            }
        }
        
        if (req.user.accountType === 'mentor' && updates.professionalExperience) {
            const validExperience = ['3_5_years', '5_10_years', '10_plus_years'];
            if (!validExperience.includes(updates.professionalExperience)) {
                return res.status(400).json({
                    message: "Invalid professional experience value"
                });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Remove password from response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpires;

        return res.status(200).json({
            message: "Profile updated successfully",
            data: userResponse
        });
    } catch (error) {
        console.log("Update profile error:", error);
        return res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = req.user;

        // Validate password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New passwords do not match"
            });
        }

        // Check current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.log("Change password error:", error);
        return res.status(500).json({
            message: "Failed to change password",
            error: error.message
        });
    }
};

// Delete account
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Delete user
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Clear cookie
        res.clearCookie('token');

        return res.status(200).json({
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.log("Delete account error:", error);
        return res.status(500).json({
            message: "Failed to delete account",
            error: error.message
        });
    }
};
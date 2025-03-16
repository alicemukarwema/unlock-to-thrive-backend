import signup from "../models/register.js";
import bcrypt from "bcrypt";

const register = async (req, res) => {
    try {
        const data = req.body;
        
        // Check if user already exists
        const check = await signup.findOne({ email: data.email });
        if (check) {
            return res.status(409).json({
                message: "User already exists in our database"
            });
        }

        // Validate password match
        if (data.password !== data.confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        
        // Create user object based on account type
        const userData = {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            accountType: data.accountType
        };
        
        // Add account type specific fields
        if (data.accountType === 'student') {
            userData.education = data.education;
        } else if (data.accountType === 'mentor') {
            userData.professionalExperience = data.professionalExperience;
            userData.expertise = data.expertise;
        }
        
        // Save user to database
        const registerInstance = new signup(userData);
        const result = await registerInstance.save();
        
        // Remove password from response
        const userResponse = result.toObject();
        delete userResponse.password;

        return res.status(201).json({
            message: "Account created successfully",
            error: null,
            data: userResponse
        });

    } catch (err) {
        console.log("Error caught:", err);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({
                message: "Validation error",
                error: errors
            });
        }
        
        return res.status(500).json({
            message: "Failed to create account",
            error: err.message
        });
    }
};

export default register;
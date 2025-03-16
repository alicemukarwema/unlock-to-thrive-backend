import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: "Full name is required"
    },
    email: {
        type: String,
        required: "Email is required",
        unique: true
    },
    phone: {
        type: String,
        required: "Phone number is required"
    },
    password: {
        type: String,
        required: "Password is required"
    },
    accountType: {
        type: String,
        enum: ['student', 'mentor'],
        required: "Account type is required"
    },
    // Student-specific fields
    education: {
        type: String,
        enum: ['high_school', 'undergraduate', 'graduate', 'other'],
        required: function() { return this.accountType === 'student'; }
    },
    // Mentor-specific fields
    professionalExperience: {
        type: String,
        enum: ['3_5_years', '5_10_years', '10_plus_years'],
        required: function() { return this.accountType === 'mentor'; }
    },
    expertise: {
        type: [String],
        validate: {
            validator: function(array) {
                return this.accountType !== 'mentor' || (array && array.length > 0);
            },
            message: "Expertise areas are required for mentors"
        }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("register", registerSchema);
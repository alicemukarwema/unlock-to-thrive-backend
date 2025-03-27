import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
        required: true
    },
    careerInterests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career'
    }],
    enrollments: [{
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending'
        },
        appliedDate: {
            type: Date,
            default: Date.now
        },
        approvedDate: Date,
        notes: String,
        skills: String,
        feedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            submittedDate: Date
        }
    }],
    skills: [String],
    bio: String,
    goals: [String],
    educationDetails: {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        graduationYear: Number
    },
    resume: {
        url: String,
        filename: String,
        uploadDate: Date
    }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;

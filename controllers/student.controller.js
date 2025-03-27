import Student from '../models/StudentApplication.js';
import Register from '../models/register.js';
import Career from '../models/career.model.js';
import mongoose from 'mongoose';

// Create or update student profile
export const createOrUpdateProfile = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        
        // Check if user exists and is a student
        const user = await Register.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.accountType !== 'student') {
            return res.status(403).json({ message: "Only students can create a student profile" });
        }
        
        // Find existing profile or create new one
        let student = await Student.findOne({ userId });
        
        if (!student) {
            student = new Student({
                userId,
                ...req.body
            });
        } else {
            // Update existing fields
            Object.keys(req.body).forEach(key => {
                if (key !== 'userId' && key !== 'enrollments') {
                    student[key] = req.body[key];
                }
            });
        }
        
        await student.save();
        
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error("Error in createOrUpdateProfile:", error);
        res.status(500).json({
            message: "Error creating/updating student profile",
            error: error.message
        });
    }
};

// Get student profile
export const getProfiles = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        
        const student = await Student.findOne({ userId })
            .populate('userId', 'fullName email phone')
            .populate({
                path: 'enrollments.careerId',
                select: 'title category level instructor'
            })
            .populate({
                path: 'enrollments.mentorId',
                select: 'fullName email'
            })
            .populate('careerInterests', 'title category level');
            
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({
            message: "Error fetching student profile",
            error: error.message
        });
    }
};

export const applyForMentor = async (req, res) => {
    try {
        const { studentId, mentorId, motivation, skills } = req.body;
        
        console.log("Applying for mentorship:", mentorId, motivation, skills);
        
        if (!mentorId) {
            return res.status(400).json({ message: "Mentor ID is required" });
        }
        
        if (!mongoose.Types.ObjectId.isValid(mentorId)) {
            return res.status(400).json({ message: "Invalid mentor ID format" });
        }
        
        let mentorObjectId;
        try {
            mentorObjectId = new mongoose.Types.ObjectId(mentorId);
        } catch (error) {
            console.error('Error processing mentor ID:', error);
            return res.status(500).json({ message: "Error processing mentor ID" });
        }
        
        const mentor = await Register.findById(mentorObjectId);
        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }
        
        let student = await Student.findOne({ userId: studentId });
        if (!student) {
            student = new Student({ userId: studentId });
        }
        
        const alreadyApplied = student.enrollments.some(enrollment => 
            enrollment.mentorId && enrollment.mentorId.toString() === mentorObjectId.toString()
        );
        
        if (alreadyApplied) {
            return res.status(400).json({ message: "Already applied to this mentor" });
        }
        
        student.enrollments.push({
            mentorId: mentorObjectId,
            notes: motivation || "",
            skills: skills || "",
            status: 'pending',
            appliedDate: new Date()
        });
        
        if (req.file) {
            student.resume = {
                url: req.file.path,
                filename: req.file.filename,
                uploadDate: new Date()
            };
        }
        
        await student.save();
        
        res.status(200).json({
            success: true,
            message: "Successfully applied to the mentor",
            data: student.enrollments[student.enrollments.length - 1]
        });
    } catch (error) {
        console.error("Error in applyForMentor:", error);
        res.status(500).json({
            message: "Error applying for mentor",
            error: error.message
        });
    }
};

export const getMentorApplications = async (req, res) => {
    try {
        const mentorId = req.params.id; // Get mentorId from URL parameter

        if (!mongoose.Types.ObjectId.isValid(mentorId)) {
            return res.status(400).json({ message: "Invalid mentor ID" });
        }
        
        // Use the 'new' keyword when creating a new ObjectId
        const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

        // Fetch the students who applied to this mentor
        const students = await Student.find({
            "enrollments": {
                $elemMatch: { mentorId: mentorObjectId } // Use the new ObjectId here
            }
        }).populate('userId', 'fullName email phone');

        if (!students || students.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No applications found for this mentor"
            });
        }
        
        // Process the enrollment data
        const applications = students.flatMap(student =>
            student.enrollments
                .filter(enrollment => enrollment.mentorId.toString() === mentorObjectId.toString())
                .map(enrollment => ({
                    enrollmentId: enrollment._id,
                    studentId: student._id,
                    student: student.userId,
                    status: enrollment.status,
                    appliedDate: enrollment.appliedDate,
                    approvedDate: enrollment.approvedDate,
                    notes: enrollment.notes
                }))
        );

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error("Error in getMentorApplications:", error);
        res.status(500).json({
            message: "Error fetching mentor applications",
            error: error.message
        });
    }
};


export const updateApplicationStatus = async (req, res) => {
    try {
        const { studentId } = req.params; // Get studentId from the URL parameters
        const { status } = req.body; // Get status from the request body

        // Check if the status is 'approved'
        if (status !== 'approved') {
            return res.status(400).json({ message: 'Invalid status. Only "approved" is allowed.' });
        }

        // Find the student and the corresponding application
        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const enrollment = student.enrollments.find(enrollment => enrollment.status === 'pending');
        if (!enrollment) {
            return res.status(404).json({ message: 'No pending application found' });
        }

        // Update the application status to 'approved'
        enrollment.status = 'approved';
        enrollment.approvedDate = new Date(); // Set the approved date to current date

        await student.save();

        return res.status(200).json({
            success: true,
            message: 'Application approved successfully',
            data: enrollment
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        return res.status(500).json({
            message: 'Error updating application status',
            error: error.message
        });
    }
};
export const getEnrolledPrograms = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        
        const student = await Student.findOne({ userId })
            .populate({
                path: 'enrollments.careerId',
                select: 'title category level description instructor imagePath'
            })
            .populate({
                path: 'enrollments.mentorId',
                select: 'fullName email'
            });
            
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        
        const enrollments = student.enrollments
            .filter(enrollment => enrollment.careerId && enrollment.mentorId)
            .map(enrollment => ({
                enrollmentId: enrollment._id,
                program: enrollment.careerId,
                mentor: enrollment.mentorId,
                status: enrollment.status,
                appliedDate: enrollment.appliedDate,
                approvedDate: enrollment.approvedDate
            }));
        
        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        console.error("Error in getEnrolledPrograms:", error);
        res.status(500).json({
            message: "Error fetching enrolled programs",
            error: error.message
        });
    }
};

// Submit feedback for a completed program
export const submitFeedback = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const { enrollmentId } = req.params;
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        
        const student = await Student.findOne({ userId });
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        
        // Find the enrollment
        const enrollmentIndex = student.enrollments.findIndex(
            e => e._id.toString() === enrollmentId
        );
        
        if (enrollmentIndex === -1) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        
        // Check if enrollment is completed
        if (student.enrollments[enrollmentIndex].status !== 'completed') {
            return res.status(400).json({ message: "Can only submit feedback for completed programs" });
        }
        
        // Add feedback
        student.enrollments[enrollmentIndex].feedback = {
            rating,
            comment,
            submittedDate: new Date()
        };
        
        await student.save();
        
        res.status(200).json({
            success: true,
            message: "Feedback submitted successfully",
            data: student.enrollments[enrollmentIndex].feedback
        });
    } catch (error) {
        console.error("Error in submitFeedback:", error);
        res.status(500).json({
            message: "Error submitting feedback",
            error: error.message
        });
    }
};

// Upload student resume
export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const userId = req.userId; // From auth middleware
        
        let student = await Student.findOne({ userId });
        if (!student) {
            student = new Student({ userId });
        }
        
        // Update resume information
        student.resume = {
            url: req.file.path, // Assuming Cloudinary URL
            filename: req.file.filename,
            uploadDate: new Date()
        };
        
        await student.save();
        
        res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            data: student.resume
        });
    } catch (error) {
        console.error("Error in uploadResume:", error);
        res.status(500).json({
            message: "Error uploading resume",
            error: error.message
        });
    }
};

// Get all students for a mentor
export const getMentorStudents = async (req, res) => {
    try {
        const mentorId = req.userId; // From auth middleware
        
        // Find all students with enrollments for this mentor
        const students = await Student.find({
            "enrollments.mentorId": mongoose.Types.ObjectId(mentorId)
        })
        .populate('userId', 'fullName email phone')
        .populate('enrollments.careerId', 'title category level');
        
        if (!students || students.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No students found for this mentor"
            });
        }
        
        // Format the response
        const formattedStudents = students.map(student => {
            // Filter enrollments to only those with this mentor
            const mentorEnrollments = student.enrollments.filter(
                e => e.mentorId && e.mentorId.toString() === mentorId && e.careerId
            );
            
            return {
                studentId: student._id,
                studentInfo: student.userId,
                enrollments: mentorEnrollments.map(e => ({
                    enrollmentId: e._id,
                    program: e.careerId,
                    status: e.status,
                    appliedDate: e.appliedDate,
                    approvedDate: e.approvedDate
                }))
            };
        });
        
        res.status(200).json({
            success: true,
            count: formattedStudents.length,
            data: formattedStudents
        });
    } catch (error) {
        console.error("Error in getMentorStudents:", error);
        res.status(500).json({
            message: "Error fetching mentor's students",
            error: error.message
        });
    }
};
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

export const applyForProgram = async (req, res) => {
    try {
        // const userId = req.userId; 
        const { userId ,careerId, motivation, skills } = req.body;
        
        console.log("hhhhhhhhhhhhiiiiiiii",careerId, motivation, skills)
        // Fix 1: Improved careerId validation
        if (!careerId) {
            return res.status(400).json({ message: "Career ID is required" });
        }
        
        if (!mongoose.Types.ObjectId.isValid(careerId)) {
            return res.status(400).json({ message: "Invalid career ID format" });
          }
          let careerObjectId;
          try {
            // Convert to ObjectId
            careerObjectId = new mongoose.Types.ObjectId(careerId);
            
            // Proceed with the rest of the logic (e.g., query the database)
            
          }  catch (error) {
            console.error('Error processing career ID:', error);
            return res.status(500).json({ message: "Error processing career ID" });
          }
        
        // Check if career exists
        const career = await Career.findById(careerObjectId);
        if (!career) {
            return res.status(404).json({ message: "Career program not found" });
        }
        
        // Find student profile or create if doesn't exist
        let student = await Student.findOne({ userId });
        if (!student) {
            student = new Student({ userId });
        }
        
        // Fix 2: More robust check for existing applications
        const alreadyApplied = student.enrollments.some(enrollment => {
            return enrollment.careerId && enrollment.careerId.toString() === careerObjectId.toString();
        });
        
        if (alreadyApplied) {
            return res.status(400).json({ message: "Already applied to this program" });
        }
        
        // Fix 3: Better mentor resolution logic
        let mentorId;
        if (career.instructorId) {
            mentorId = career.instructorId;
        } else if (career.instructor) {
            try {
                // Try to treat as ObjectId
                mentorId = mongoose.Types.ObjectId(career.instructor);
            } catch (error) {
                // If not an ObjectId, it might be a string name or "TBD"
                if (career.instructor !== "TBD") {
                    // Try to find a mentor by name
                    const mentor = await Register.findOne({ 
                        fullName: { $regex: career.instructor, $options: 'i' },
                        accountType: 'mentor'
                    });
                    
                    if (mentor) {
                        mentorId = mentor._id;
                    } else {
                        // If no mentor found, assign a default mentor or admin
                        const anyMentor = await Register.findOne({ accountType: 'mentor' });
                        if (anyMentor) {
                            mentorId = anyMentor._id;
                        } else {
                            return res.status(404).json({ message: "No mentors available in the system" });
                        }
                    }
                } else {
                    // If TBD, assign any available mentor
                    const anyMentor = await Register.findOne({ accountType: 'mentor' });
                    if (anyMentor) {
                        mentorId = anyMentor._id;
                    } else {
                        return res.status(404).json({ message: "No mentors available in the system" });
                    }
                }
            }
        } else {
            // No instructor info at all, try to find any available mentor
            const anyMentor = await Register.findOne({ accountType: 'mentor' });
            if (anyMentor) {
                mentorId = anyMentor._id;
            } else {
                return res.status(404).json({ message: "No mentors available in the system" });
            }
        }
        
        // Fix 4: Properly add enrollment with validated IDs
        student.enrollments.push({
            careerId: careerObjectId,
            mentorId: mentorId,
            notes: motivation || "",
            status: 'pending',
            appliedDate: new Date()
        });
        
        // Fix 5: Better career interests handling
        const hasInterest = student.careerInterests.some(interest => 
            interest && interest.toString() === careerObjectId.toString()
        );
        
        if (!hasInterest) {
            student.careerInterests.push(careerObjectId);
        }
        
        // Handle resume upload if present
        if (req.file) {
            student.resume = {
                url: req.file.path, // Assuming Cloudinary URL
                filename: req.file.filename,
                uploadDate: new Date()
            };
        }
        
        await student.save();
        
        res.status(200).json({
            success: true,
            message: "Successfully applied to the program",
            data: student.enrollments[student.enrollments.length - 1]
        });
    } catch (error) {
        console.error("Error in applyForProgram:", error);
        res.status(500).json({
            message: "Error applying for program",
            error: error.message
        });
    }
};

// Get all applications for a specific program (for mentors)
export const getProgramApplications = async (req, res) => {
    try {
        const mentorId = req.userId; // From auth middleware
        const { careerId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(careerId)) {
            return res.status(400).json({ message: "Invalid career ID" });
        }
        
        // Find all students who applied to this program with this mentor
        const students = await Student.find({
            "enrollments": {
                $elemMatch: {
                    careerId: mongoose.Types.ObjectId(careerId),
                    mentorId: mongoose.Types.ObjectId(mentorId)
                }
            }
        }).populate('userId', 'fullName email phone');
        
        if (!students || students.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No applications found for this program"
            });
        }
        
        // Extract relevant enrollment data
        const applications = students.map(student => {
            const enrollment = student.enrollments.find(
                e => e.careerId && e.careerId.toString() === careerId && 
                     e.mentorId && e.mentorId.toString() === mentorId
            );
            
            if (!enrollment) return null;
            
            return {
                enrollmentId: enrollment._id,
                studentId: student._id,
                student: student.userId,
                status: enrollment.status,
                appliedDate: enrollment.appliedDate,
                approvedDate: enrollment.approvedDate,
                notes: enrollment.notes
            };
        }).filter(app => app !== null);
        
        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error("Error in getProgramApplications:", error);
        res.status(500).json({
            message: "Error fetching program applications",
            error: error.message
        });
    }
};

// Update application status (approve/reject) - for mentors
export const updateApplicationStatus = async (req, res) => {
    try {
        const mentorId = req.userId; // From auth middleware
        const { studentId, careerId } = req.params;
        const { status, notes } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
        }
        
        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        // Find the enrollment
        const enrollmentIndex = student.enrollments.findIndex(
            e => e.careerId && e.careerId.toString() === careerId && 
                 e.mentorId && e.mentorId.toString() === mentorId
        );
        
        if (enrollmentIndex === -1) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        
        // Update the enrollment
        student.enrollments[enrollmentIndex].status = status;
        student.enrollments[enrollmentIndex].notes = notes || student.enrollments[enrollmentIndex].notes;
        
        if (status === 'approved') {
            student.enrollments[enrollmentIndex].approvedDate = new Date();
        }
        
        await student.save();
        
        res.status(200).json({
            success: true,
            message: `Application ${status}`,
            data: student.enrollments[enrollmentIndex]
        });
    } catch (error) {
        console.error("Error in updateApplicationStatus:", error);
        res.status(500).json({
            message: "Error updating application status",
            error: error.message
        });
    }
};

// Get enrolled programs for a student
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
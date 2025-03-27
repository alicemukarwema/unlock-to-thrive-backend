import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Controllers
import {
  create, 
  update, 
  deleteCareer, 
  findAll, 
  findOne, 
  deleteCareerResource,
  updateCareerResource,
  addResourceToCareers,
  getCareerResources
} from '../controllers/career.controller.js';

import { 
  register,
  getAllMentors 
} from '../controllers/register.js';

import signin from '../controllers/signin.js';
import { 
  requestPasswordReset, 
  resetPassword 
} from '../controllers/resetPassword.js';

import { 
  getProfile,
  updateProfile, 
  changePassword, 
  deleteAccount 
} from '../controllers/users.js';

import {
  createOrUpdateProfile,
  getProfiles,
  applyForMentor,
  updateApplicationStatus,
  getEnrolledPrograms,
  submitFeedback,
  uploadResume,
  getMentorApplications,
  getMentorStudents
} from '../controllers/student.controller.js';

// Middleware
import auth from '../middleware/auth.js';
import upload from '../config/cloudinary-multer.js';


const router = express.Router();

// Middleware Configuration
router.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Authentication Routes
router.post('/register', register);
router.post('/signin', signin);
router.post('/request-reset-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// User Profile Routes (Protected)
router.route('/profile')
  .get(auth, getProfiles)
  .put(auth, updateProfile);

router.post('/change-password', auth, changePassword);
router.delete('/account', auth, deleteAccount);

// Career Routes
router.route('/careers')
  .post(upload.single('image'), create)
  .get(findAll);

router.route('/careers/:id')
  .get(findOne)
  .put(upload.single('image'), update)
  .delete(deleteCareer);

// Career Metadata Routes
// router.get('/careers/meta/categories', getCategories);
// router.get('/careers/meta/levels', getLevels);
router.get('/careers/resources/:id', getCareerResources);
router.post('/careers/:careerId/resources',addResourceToCareers);
router.put('/careers/:careerId/resources/:resourceId', auth, updateCareerResource);
router.delete('/careers/:careerId/resources/:resourceId', auth, deleteCareerResource);
// Student Profile Routes
router.route('/students/profile')
  .post(auth, createOrUpdateProfile)
  .get(auth, getProfile);

router.post('/students/resume', auth, upload.single('resume'), uploadResume);

// Student Enrollment Routes
router.route('/students/apply')
  .post(upload.single('resume'), applyForMentor);

router.get('/students/enrollments', auth, getEnrolledPrograms);
router.post('/students/feedback/:enrollmentId', auth, submitFeedback);

// Mentor Routes
// router.get('/mentors/applications/:careerId', auth, getProgramApplications);
// router.put('/mentors/applications/:studentId/:careerId', auth, updateApplicationStatus);
router.get('/mentors/students', auth, getMentorStudents);
router.get('/mentors', getAllMentors);
router.get('/mentors/applications', getMentorApplications);
router.put('/mentors/applications/:studentId', updateApplicationStatus);
router.get('/mentors/applications/:id', getMentorApplications);

export default router;

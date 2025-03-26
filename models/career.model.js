import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'YouTube Video', 
      'Online Course', 
      'Article', 
      'Book', 
      'Podcast', 
      'Tutorial', 
      'Certification', 
      'Workshop', 
      'Conference', 
      'Webinar'
    ],
    required: true
  },
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  author: { type: String },
  platform: { type: String },
  duration: { type: String }, // e.g., '2 hours', '6 weeks'
  cost: { 
    type: String,
    enum: ['Free', 'Paid', 'Freemium'],
    default: 'Free'
  },
  rating: { type: Number, min: 0, max: 5 }
});

const careerSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiencyLevel: {
    type: String,
    enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Basic'
  },
  description: { type: String },
  learningResources: [resourceSchema]
});

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true, 
      enum: ["Technology", "Business", "Marketing", "Design", "Personal Development", "Healthcare", "Education"] 
    },
    level: { 
      type: String, 
      required: true, 
      enum: ["Beginner", "Intermediate", "Advanced"] 
    },
    description: { type: String, default: "" },
    instructor: { type: String, default: "TBD" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    imagePath: { type: String, default: "/default-career.jpg" },
    mentorshipDuration: { type: String, default: "3 months" },
    weeklyCommitment: { type: String, default: "2 hours" },
    maxMentees: { type: Number, default: 5, min: 1 },
    
    // New fields for comprehensive career development
    requiredSkills: [careerSkillSchema],
    recommendedResources: [resourceSchema],
    
    // Career path and progression details
    careerPathways: [{
      title: { type: String },
      description: { type: String },
      potentialRoles: [String],
      averageSalaryRange: {
        min: { type: Number },
        max: { type: Number }
      }
    }],
    
    // Industry insights and trends
    industryTrends: [{
      trend: { type: String },
      description: { type: String },
      relevance: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
      },
      lastUpdated: { type: Date, default: Date.now }
    }],
    
    // Networking and professional growth
    professionalNetworks: [{
      name: { type: String },
      type: {
        type: String,
        enum: ['LinkedIn Group', 'Professional Association', 'Online Community', 'Forum']
      },
      url: { type: String },
      description: { type: String }
    }]
  },
  { timestamps: true }
);

careerSchema.index({ 
  title: "text", 
  instructor: "text", 
  description: "text",
  "requiredSkills.name": "text",
  "recommendedResources.title": "text"
});

const Career = mongoose.model("Career", careerSchema);
export default Career;
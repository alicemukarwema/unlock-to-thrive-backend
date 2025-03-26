import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://amukarwema:amukarwema@cluster0.qto0s.mongodb.net/?retryWrites=true&w=majority&appName=unlock-to-thrive')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use("/api", routes);

// Home route
app.get("/", (req, res) => {
  res.send("Mentorship Platform API is running");
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

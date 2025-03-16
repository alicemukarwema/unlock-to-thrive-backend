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
  origin: '*', // Allow all origins
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB (MongoDB Atlas for free cloud-hosted DB)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorship';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use("/api", routes);


// Home route
app.get("/", (req, res) => {
  res.send("Mentorship Platform API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

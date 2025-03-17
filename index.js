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

// CORS Configuration - Allow frontend access
const allowedOrigins = ["https://unlocktothrive.netlify.app"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies & authorization headers
  methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
  allowedHeaders: "Content-Type,Authorization", // Allowed headers
}));

// Middleware
app.use(express.json());

// Connect to MongoDB (MongoDB Atlas for cloud DB)
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://amukarwema:amukarwema@cluster0.qto0s.mongodb.net/yourDatabaseName?retryWrites=true&w=majority&appName=unlock-to-thrive";

mongoose.connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after MongoDB connection is established
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    // Optionally exit the process if DB connection fails
    process.exit(1);
  });

// Routes
app.use("/api", routes);

// Home route
app.get("/", (req, res) => {
  res.send("Mentorship Platform API is running");
});

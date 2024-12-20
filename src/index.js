const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const movieRouter = require("./controllers/movie"); // Renaming router to movieRouter for clarity
const movieIdRouter = require("./controllers/mivieid"); // Renaming Router to movieIdRouter for clarity
const authRouter = require("./controllers/Auth"); // Renaming Route to authRouter for clarity

const cookieParser = require("cookie-parser");
dotenv.config();

const app = express();
app.use(express.json());
// CORS Middleware
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Define routes
app.use("/", movieRouter);  // Main route for movies
app.use("/in", movieIdRouter);  // Route for movie details
app.use("/auth", authRouter);  // Authentication routes

// Set the port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});

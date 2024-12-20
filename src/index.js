const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const movieRouter = require("./controllers/movie");
const movieIdRouter = require("./controllers/mivieid");
const authRouter = require("./controllers/Auth");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(express.json());

// Define allowed origins
const allowedOrigins = process.env.ORIGINS||["http://localhost:5174"];

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, // Allow credentials
}));

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Define routes
app.use("/", movieRouter);
app.use("/in", movieIdRouter);
app.use("/auth", authRouter);

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

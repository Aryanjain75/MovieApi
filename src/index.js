const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const movieRouter = require("./controllers/movie");
const movieIdRouter = require("./controllers/mivieid");
const authRouter = require("./controllers/Auth");
const cookieParser = require("cookie-parser");
const ReviewRouter=require("./controllers/Review");
dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = process.env.ORIGINS||["http://localhost:5174","http://localhost:5173/"];

app.use(cors({
    origin: 'http://localhost:5173', // Specifies the allowed origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Lists allowed HTTP methods
    credentials: true // Allows credentials (e.g., cookies, authorization headers)
}));
// Middleware for parsing JSON and URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Define routes
app.use("/", movieRouter);
app.use("/in", movieIdRouter);
app.use("/auth", authRouter);
app.use("/Review", ReviewRouter);

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

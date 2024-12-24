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
    origin: allowedOrigins, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true 
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", movieRouter);
app.use("/in", movieIdRouter);
app.use("/auth", authRouter);
app.use("/Review", ReviewRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});

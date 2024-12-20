const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./controllers/movie");
const rout=require("./controllers/mivieid");
const route =require("./controllers/Auth");
dotenv.config();
const app = express();
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
const PORT = process.env.PORT || 3000;
app.use("/", router);
app.use("/in",rout);
app.use("/auth",route)
app.listen(PORT, (err) => {
    if (err) {
        console.error("Error starting server:", err);
    } else {
        console.log(`Server running on port ${PORT}`);
    }
});

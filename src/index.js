const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./controllers/movie");
const Router=require("./controllers/mivieid");
// const Route =require("./controllers/Auth");
dotenv.config();
const app = express();
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
const PORT = process.env.PORT || 3000;
app.use("/", router);
app.use("/in",Router);
// app.use("/auth",Route)
app.listen(PORT, (err) => {
    if (err) {
        console.error("Error starting server:", err);
    } else {
        console.log(`Server running on port ${PORT}`);
    }
});

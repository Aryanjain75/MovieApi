const express = require("express");
const Router = express.Router();
const {login,validateToken,signup,forgetPassword}=require("../handlers/Authhandlers");
dotenv.config();
Router.post("/login", login);
Router.post("/signup",signup )
Router.put("/forgetPassword",forgetPassword);
Router.get("/getDetails", validateToken,userDetails);
Router.post("/logout", logout);

module.exports = Router;

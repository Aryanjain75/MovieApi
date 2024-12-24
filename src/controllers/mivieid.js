const express = require("express");
const Router = express.Router();
const {givrreview,updatemovie,deletemovie,getmovie}=require("../handlers/movieidhandlers");
Router.put("/givrreview/:id",givrreview)
Router.put("/updatemovie/:id",updatemovie );
Router.delete("/deletemovie/:id", deletemovie);
Router.get("/getmovie/:id", getmovie);
module.exports=Router;

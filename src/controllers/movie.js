const express = require("express");
const router = express.Router();
const  { getmovie, postmovie, uploads, filters, apifilters }= require("../handlers/moviehandler");
router.get('/api/filters',apifilters);
router.get("/getmovies",getmovie);
router.get("/filters", filters);
router.post("/postmovie",postmovie);
router.get("/upload",uploads);

module.exports = router;

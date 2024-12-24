const express = require('express');
const app = express();
const Router=express.Router();
const {
  reviewemailid,
  reviewemail,
  manageReview,
  reviews,
  reviewsarray,
  reviewmovieid,
  deletereviewidmovie,
  reviewid
}=require("../handler/Reviewhandler");
Router.get("/reviews/:id/:email",reviewemailid );
Router.get("/reviews/:email",reviewemail );
Router.get("/manage",manageReview);

Router.post("/reviews", reviews);
Router.post("/reviewsarray",reviewsarray );
Router.put("/reviews/:id/:Movieid",reviewmovieid);

Router.delete("/reviews/:id/:Movieid",deletereviewidmovie);
Router.get("/review/:id", reviewid);

module.exports=Router;

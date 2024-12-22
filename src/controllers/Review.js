const express = require('express');
const app = express();
const Router=express.Router();
const { db } = require("../firebase"); 
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs ,query,where} = require("firebase/firestore");
const ReviewsCollection = collection(db, "reviews");
Router.get("/reviews/:id/:email", async (req, res) => {
    try {
        const { id,email } = req.params; // Movie ID from the request parameters
        const reviewsQuery = query(ReviewsCollection, where("movieId", "==", id),where("email","==",email));
        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = querySnapshot.docs.map(doc => (
            {  ...doc.data() }
        ));
        res.status(200).json({
            message: "Reviews fetched successfully",
            data: reviews
        });
    } catch (e) {
        console.error("Error fetching reviews:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});
// Create a new review
Router.post("/reviews", async (req, res) => {
  try {
    const reviewData = req.body;
    const newReviewRef = doc(ReviewsCollection);
    await setDoc(newReviewRef, reviewData);
    res.status(201).json({
      message: "Review created successfully",
      id: newReviewRef.id
    });
  } catch (e) {
    console.error("Error creating review:", e);
    res.status(500).json({ error: e.message, message: "Server down" });
  }
});
Router.post("/reviewsarray", async (req, res) => {
    try {
      const reviewData = req.body;
      const data=[];
      reviewData.forEach(async (review) => {
        const newReviewRef = doc(ReviewsCollection);
        await setDoc(newReviewRef, review);
        data.push({ReviewId:newReviewRef.id,"Success":true});
      });
      res.status(201).json({data:data,givenmovieData:reviewData});
    } catch (e) {
      console.error("Error creating review:", e);
      res.status(500).json({ error: e.message, message: "Server down" });
    }
  });
Router.put("/reviews/:id/:Movieid", async (req, res) => {
  try {
    const { id, Movieid } = req.params;
    const updateData = req.body;
    const reviewsQuery = query(
      ReviewsCollection,
      where("id", "==", id),
      where("movieId", "==", Movieid)
    );
    const querySnapshot = await getDocs(reviewsQuery);
    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Review not found" });
    }
    const reviewDocRef = querySnapshot.docs[0].ref;
    await updateDoc(reviewDocRef, updateData);

    res.status(200).json({ message: "Review updated successfully" });
  } catch (e) {
    console.error("Error updating review:", e);
    res.status(500).json({ error: e.message, message: "Server down" });
  }
});

// Delete a review
Router.delete("/reviews/:id/:Movieid", async (req, res) => {
  try {
    const { id,Movieid } = req.params;
    const reviewRef = query(ReviewsCollection,
                            where("id", "==", id),
                            where("movieId", "==", Movieid));
    await deleteDoc(reviewRef);
    res.status(200).json({
      message: "Review deleted successfully"
    });
  } catch (e) {
    console.error("Error deleting review:", e);
    res.status(500).json({ error: e.message, message: "Server down" });
  }
});

// Get a single review by ID
Router.get("/review/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reviewRef = query(ReviewsCollection, where("movieId","==",id));
    const reviewDoc = await getDocs(reviewRef);
    
     if (reviewSnapshot.empty) {
      return res.status(404).json({ message: "Review not found" });
    }


    res.status(200).json({
      message: "Review fetched successfully",
      data: {
        id: reviewDoc.id,
        ...reviewDoc.data()
      }
    });
  } catch (e) {
    console.error("Error fetching review:", e);
    res.status(500).json({ error: e.message, message: "Server down" });
  }
});
module.exports=Router;

const express = require('express');
const app = express();
const Router=express.Router();
const { db } = require("../firebase"); 
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } = require("firebase/firestore");
const ReviewsCollection = collection(db, "reviews");
Router.get("/reviews/:id", async (req, res) => {
    try {
        const { id } = req.params; // Movie ID from the request parameters
        const reviewsQuery = query(ReviewsCollection, where("movieid", "==", id));
        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() 
        }));
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

// Update a review
Router.put("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const reviewRef = doc(ReviewsCollection, id);
    await updateDoc(reviewRef, updateData);
    res.status(200).json({
      message: "Review updated successfully"
    });
  } catch (e) {
    console.error("Error updating review:", e);
    res.status(500).json({ error: e.message, message: "Server down" });
  }
});

// Delete a review
Router.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reviewRef = doc(ReviewsCollection, id);
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
    const reviewRef = doc(ReviewsCollection, id);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
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

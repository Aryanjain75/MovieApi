const express = require('express');
const app = express();
const Router=express.Router();
const { db } = require("../firebase"); 
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs ,query,where} = require("firebase/firestore");
const ReviewsCollection = collection(db, "reviews");
const moviesCollection = collection(db, "movies");

Router.get("/reviews/:id/:email", async (req, res) => {
    try {
        const { id,email } = req.params; // Movie ID from the request parameters
        const reviewsQuery = query(ReviewsCollection, where("movieId", "==", id),where("email","==",email));
        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = querySnapshot.docs.map(doc => ({  ...doc.data(),MAINID:doc.id }));
        res.status(200).json({message: "Reviews fetched successfully",data: reviews});
    } catch (e) {
        console.error("Error fetching reviews:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});

Router.get("/reviews/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Query reviews for the given email
    const reviewsQuery = query(ReviewsCollection, where("email", "==", email));
    const reviewsSnapshot = await getDocs(reviewsQuery);

    // Collect reviews and associated movie IDs
    const reviews = [];
    const movieIds = new Set();

    reviewsSnapshot.forEach((doc) => {
      const reviewData = doc.data();
      reviews.push({
        ...reviewData,
        reviewId: doc.id, // Add review document ID
      });

      if (reviewData.movieid) {
        movieIds.add(reviewData.movieid);
      }
    });

    if (reviews.length === 0) {
      return res
        .status(200)
        .json({ message: "No reviews found for the given email", data: [] });
    }

    // Query movies collection for the collected movie IDs
    const moviesQuery = query(
      moviesCollection,
      where("id", "in", Array.from(movieIds))
    );
    const moviesSnapshot = await getDocs(moviesQuery);

    const movies = {};
    moviesSnapshot.forEach((doc) => {
      const movieData = doc.data();
      movies[movieData.id] = {
        id: movieData.id,
        title: movieData.title,
        movieImage: movieData.movieImage,
        imageCaption: movieData.imageCaption,
        releaseYear: movieData.releaseYear,
        ratingsSummary: movieData.ratingsSummary,
        runtime: movieData.runtime,
        certificate: movieData.certificate,
        tags: movieData.tags,
        latestTrailer: movieData.latestTrailer,
        reviews: movieData.reviews || [],
        reviewstars: movieData.reviewstars || 0,
      };
    });

    // Enrich reviews with corresponding movie details
    const enrichedReviews = reviews.map((review) => ({
      ...review,
      movieDetails: movies[review.movieid] || null, // Attach movie details if found
    }));

    res
      .status(200)
      .json({ message: "Reviews fetched successfully", data: enrichedReviews });
  } catch (e) {
    console.error("Error fetching reviews:", e);
    res.status(500).json({ error: e.message, message: "Server error" });
  }
});

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
// Get a single review by movie ID
Router.get("/review/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reviewRef = query(ReviewsCollection, where("movieId", "==", id));
    const reviewSnapshot = await getDocs(reviewRef);
    if (reviewSnapshot.empty) { return res.status(404).json({ message: "Review not found" });}
    const reviews = reviewSnapshot.docs.map((doc) => ({...doc.data(),MAINID:doc.id}));
    res.status(200).json({message: "Review(s) fetched successfully",data: reviews,});
  } catch (e) {
    console.error("Error fetching review:", e);
    res.status(500).json({ error: e.message, message: "Server down" });
  }
});

module.exports=Router;

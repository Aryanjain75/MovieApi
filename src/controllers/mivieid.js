const express = require("express");
const Router = express.Router();
const { db } = require("../firebase"); 
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } = require("firebase/firestore");
const moviesCollection = collection(db, "movies");

Router.put("/givrreview/:id",async(req,res)=>{
    try {
        const { id } = req.params;
        const { name,email,review, stars } = req.body;
        const movieDocRef = doc(moviesCollection, id);
        const movieDocSnap = await getDoc(movieDocRef);
        if (!movieDocSnap.exists()) {
            return res.status(404).json({ message: "Movie not found" });
        }
        const movieData = movieDocSnap.data();
        const data={
            name:name,
            email:email,
            review:review,
            stars:stars
        }
        const updatedReviews = [...movieData.reviews, review];
        const updatedStars = (movieData.reviewstars*5 + stars)/5;
        const updatedMovie = {
            ...movieData,
            reviews: updatedReviews,
            reviewstars: updatedStars
        };
        await updateDoc(movieDocRef, updatedMovie);
        res.status(200).json({ message: "Review added successfully", data: updatedMovie });
    } catch (e) {
        console.error("Error adding review:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
})
Router.put("/updatemovie/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, movieImage, imageCaption, releaseYear, ratingsSummary, runtime, certificate, tags, latestTrailer } = req.body;
        const movieDocRef = doc(moviesCollection, id);
        const movieDocSnap = await getDoc(movieDocRef);
        if (!movieDocSnap.exists()) {
            return res.status(404).json({ message: "Movie not found" });
        }
        const updatedMovie = {
            title,
            movieImage,
            imageCaption,
            releaseYear,
            ratingsSummary,
            runtime,
            certificate,
            tags,
            latestTrailer
        };
        await updateDoc(movieDocRef, updatedMovie);
        res.status(200).json({ message: "Movie updated successfully", data: updatedMovie });
    } catch (e) {
        console.error("Error updating movie:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});
Router.delete("/deletemovie/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const movieDocRef = doc(moviesCollection, id);
        const movieDocSnap = await getDoc(movieDocRef);
        if (!movieDocSnap.exists()) {
            return res.status(404).json({ message: "Movie not found" });
        }
        await deleteDoc(movieDocRef);
        res.status(200).json({ message: "Movie deleted successfully" });
    } catch (e) {
        console.error("Error deleting movie:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});
Router.get("/getmovie/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const movieDocRef = doc(moviesCollection, id); 
        const movieDocSnap = await getDoc(movieDocRef);
        if (!movieDocSnap.exists()) {
            return res.status(404).json({ message: "Movie not found" });
        }
        const movieData = movieDocSnap.data();
        let tags = movieData.tags.map(tag => [tag]); 
        res.status(200).json({
            id: movieData.id,
            title: movieData.title,
            movieImage: movieData.movieImage,
            imageCaption: movieData.imageCaption,
            releaseYear: movieData.releaseYear,
            ratingsSummary: movieData.ratingsSummary,
            runtime: movieData.runtime,
            certificate: movieData.certificate,
            tags: tags,
            latestTrailer: movieData.latestTrailer,
            reviews: movieData.reviews || [],
            reviewstars: movieData.reviewstars || 0
        });
    } catch (e) {
        console.error("Error fetching movie data:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});
module.exports=Router;

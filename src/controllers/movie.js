const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } = require("firebase/firestore");
const moviesCollection = collection(db, "movies");
const moviedata = require("../Model/movie.json");

// Get movies with pagination
router.get("/getmovies", async (req, res) => {
    try {
        const { start = 0, end = 10 } = req.query; // Dynamic pagination
        const val = [];
        const snapshot = await getDocs(moviesCollection);
        snapshot.forEach((doc) => {
            const movieData = doc.data();
            val.push({
                id: movieData.id,
                title: movieData.title,
                movieImage: movieData.movieImage,
                imageCaption: movieData.imageCaption,
                releaseYear: movieData.releaseYear,
                ratingsSummary: movieData.ratingsSummary,
                runtime: movieData.runtime,
                certificate: movieData.certificate,
                tags: movieData.tags, // Ensure tags are stored as flat arrays
                latestTrailer: movieData.latestTrailer,
                reviews: movieData.reviews || [],
                reviewstars: movieData.reviewstars || 0,
            });
        });

        res.status(200).json({
            size: val.length,
            data: val,
            paginated: val.slice(start, end),
            paginatedlength: val.slice(start, end).length,
        });
    } catch (e) {
        console.error("Error fetching movie data:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});

// Add a new movie
router.post("/postmovie", async (req, res) => {
    try {
        const { id, title, movieImage, imageCaption, releaseYear, ratingsSummary, runtime, certificate, tags, latestTrailer } = req.body;
        const movieDocRef = doc(moviesCollection, id.toString());
        const movieDocSnap = await getDoc(movieDocRef);

        if (movieDocSnap.exists()) {
            return res.status(409).json({ message: "Movie already exists" });
        }

        const newMovie = {
            id,
            title,
            movieImage,
            imageCaption,
            releaseYear,
            ratingsSummary,
            runtime,
            certificate,
            tags: tags || [], // Ensure tags are flat arrays
            latestTrailer,
            reviews: [],
            reviewstars: 0,
        };

        await setDoc(movieDocRef, newMovie);
        res.status(201).json({ message: "Movie added successfully", data: newMovie });
    } catch (e) {
        console.error("Error adding movie:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});

// Upload movies from JSON
router.get("/upload", async (req, res) => {
    try {
        const { start = 0, end = 10 } = req.query; // Dynamic pagination
        const val = [];
        let vol=[];
        for (const v of moviedata.data.showtimesTitles.edges) {
            const tags = v.node.titleGenres.genres.map((genre) => genre.genre.text);

            const newMovie = {
                id: v.node.id,
                title: v.node.titleText.text,
                movieImage: v.node.primaryImage.url,
                imageCaption: v.node.primaryImage.caption.plainText,
                releaseYear: v.node.releaseYear,
                ratingsSummary: v.node.ratingsSummary,
                runtime: v.node.runtime,
                certificate: v.node.certificate,
                tags,
                latestTrailer: v.node.latestTrailer,
                reviews: [],
                reviewstars: 0,
            };

            const movieDocRef = doc(moviesCollection, v.node.id.toString());
            const movieDocSnap = await getDoc(movieDocRef);

            if (movieDocSnap.exists()) {
                vol.push(`${v.node.titleText.text} already exists`);
                continue; 
            }

            await setDoc(movieDocRef, newMovie);
            val.push(newMovie);
        }

        res.status(200).json({
            status:vol,
            size: val.length,
            data: val,
            paginated: val.slice(start, end),
            paginatedlength: val.slice(start, end).length,
        });
    } catch (e) {
        console.error("Error uploading movie data:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
});

module.exports = router;

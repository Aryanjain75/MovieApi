const { db } = require("../firebase");
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } = require("firebase/firestore");
const moviesCollection = collection(db, "movies");
const moviedata = require("../Model/movie.json");

const getMovieAggregations = async () => {
    try {
      const moviesRef = db.collection('movies');
      const snapshot = await moviesRef.get();
  
      const genres = new Set();
      const years = new Set();
      let maxRating = -Infinity;
      let minRating = Infinity;
  
      snapshot.forEach((doc) => {
        const movieData = doc.data();
        if (movieData.genres) {
          movieData.genres.forEach((genre) => genres.add(genre));
        }
        if (movieData.releaseYear && movieData.releaseYear.year) {
          years.add(movieData.releaseYear.year);
        }
        const rating = movieData.ratingsSummary?.aggregateRating;
        if (rating !== undefined) {
          maxRating = Math.max(maxRating, rating);
          minRating = Math.min(minRating, rating);
        }
      });
  
      return {
        genres: Array.from(genres),  // Convert Set to Array
        years: Array.from(years),    // Convert Set to Array
        ratings: { max: maxRating, min: minRating },
      };
  
    } catch (error) {
      console.error('Error fetching movie aggregations:', error);
      throw new Error('Failed to fetch data');
    }
  };
const apifilters= async (req, res) => {
    try {
      const aggregations = await getMovieAggregations();
      res.json(aggregations);
      
    } catch (error) {
      res.status(500).send('Error fetching filters');
    }
  };
  const getmovie= async (req, res) => {
    try {
        const {
            start = 0,
            end = 10,
            title,
            minYear,
            maxYear,
            minRating,
            maxRating,
            tags,
            certificate,
        } = req.query;

        const val = [];
        const snapshot = await getDocs(moviesCollection);
        snapshot.forEach((doc) => {
            const movieData = doc.data();
            val.push({
                id: movieData?.id,
                title: movieData?.title,
                movieImage: movieData?.movieImage,
                imageCaption: movieData?.imageCaption,
                releaseYear: movieData?.releaseYear?.year || null,
                ratingsSummary: movieData?.ratingsSummary,
                runtime: movieData?.runtime?.seconds || null,
                certificate: movieData?.certificate || null,
                tags: movieData?.tags || [], // Ensure tags are stored as flat arrays
                latestTrailer: movieData?.latestTrailer,
                reviews: movieData?.reviews || [],
                reviewstars: movieData?.reviewstars || 0,
            });
        });
        let filteredMovies = val;
        if (title) {
            const titleLowerCase = title.toLowerCase();
            filteredMovies = filteredMovies.filter((movie) =>
                movie.title.toLowerCase().includes(titleLowerCase)
            );
        }
        if (minYear) {
            filteredMovies = filteredMovies.filter(
                (movie) => movie.releaseYear >= parseInt(minYear)
            );
        }
        if (maxYear) {
            filteredMovies = filteredMovies.filter(
                (movie) => movie.releaseYear <= parseInt(maxYear)
            );
        }
        if (minRating) {
            filteredMovies = filteredMovies.filter(
                (movie) => movie.ratingsSummary.aggregateRating >= parseFloat(minRating)
            );
        }
        if (maxRating) {
            filteredMovies = filteredMovies.filter(
                (movie) => movie.ratingsSummary.aggregateRating <= parseFloat(maxRating)
            );
        }

        if (tags) {
            const tagArray = tags.split(","); // Expect comma-separated tags in query
            filteredMovies = filteredMovies.filter((movie) =>
                tagArray.every((tag) => movie.tags.includes(tag))
            );
        }
        if (certificate) {
            filteredMovies = filteredMovies.filter(
                (movie) => movie.certificate === certificate
            );
        }
        const paginatedMovies = filteredMovies.slice(start, end);
        res.status(200).json({
            size: filteredMovies.length, 
            data: filteredMovies,
            paginated: paginatedMovies, 
            paginatedlength: paginatedMovies.length, 
        });
    } catch (e) {
        console.error("Error fetching movie data:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
}
const filters=async (req, res) => {
    try {
        const snapshot = await getDocs(moviesCollection);
        const tagsSet = new Set();
        const certificatesSet = new Set();
        const releaseYearsSet = new Set();
        snapshot.forEach((doc) => {
            const movieData = doc.data();

            if (Array.isArray(movieData.tags)) {
                movieData.tags.forEach((tag) => tagsSet.add(tag));
            }
            if (movieData.certificate) {
                certificatesSet.add(movieData.certificate);
            }
            if (movieData.releaseYear?.year) {
                releaseYearsSet.add(movieData.releaseYear.year);
            }
        });
        const tags = Array.from(tagsSet).sort();
        const certificates = Array.from(certificatesSet).sort();
        const releaseYears = Array.from(releaseYearsSet).sort((a, b) => a - b); // Sort numerically

        res.status(200).json({
            message: "Filter metadata fetched successfully",
            data: {
                tags,
                certificates,
                releaseYears,
            },
        });
    } catch (e) {
        console.error("Error fetching filter metadata:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
}
const postmovie= async (req, res) => {
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
}
const uploads= async (req, res) => {
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
}
module.exports = { getmovie, postmovie, uploads, filters, apifilters }; 

const { db } = require("../firebase"); 
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs ,query,where} = require("firebase/firestore");
const ReviewsCollection = collection(db, "reviews");
const moviesCollection = collection(db, "movies");
const reviewemailid=async (req, res) => {
    try {
        const { id,email } = req.params; 
        const reviewsQuery = query(ReviewsCollection, where("movieId", "==", id),where("email","==",email));
        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = querySnapshot.docs.map(doc => ({  ...doc.data(),MAINID:doc.id }));
        res.status(200).json({message: "Reviews fetched successfully",data: reviews});
    } catch (e) {
        console.error("Error fetching reviews:", e);
        res.status(500).json({ error: e.message, message: "Server down" });
    }
}
const reviewemail=async (req, res) => {
    try {
      const { email } = req.params;
      const reviewsQuery = query(ReviewsCollection, where("email", "==", email));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      if (reviewsSnapshot.empty) {
        return res.status(404).json({ message: "No reviews found" });
      }
      const reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      const reviewsData = await Promise.all(
        reviews.map(async (review) => {
          const MovieQuery = query(moviesCollection, where("id", "==", review.movieId));
          const MovieSnapshot = await getDocs(MovieQuery);
          const movie = MovieSnapshot.empty ? null : MovieSnapshot.docs[0].data();
  
          return {
            id: review.id,
            email: review.email,
            movieId: review.movieId,
            description:review.description,
            stars: review.rating,
            name: review.name,
            movie,
          };
        })
      );
  
      res.status(200).json({ message: "Reviews fetched successfully", data: reviewsData });
    } catch (e) {
      console.error("Error fetching reviews:", e);
      res.status(500).json({ error: e.message, message: "Server error" });
    }
  };
const manageReview =  async (req, res) => {
    try {
      const reviewSnapshot = await getDocs(ReviewsCollection);
      if (reviewSnapshot.empty) {
        return res.status(404).json({ message: "No reviews found" });
      }
      let movieRatingsMap = new Map();
      reviewSnapshot.docs.forEach((doc) => {
        const reviewData = doc.data();
        const { movieId, rating } = reviewData;
  
        if (!movieRatingsMap.has(movieId)) {
          movieRatingsMap.set(movieId, { voteCount: 0, aggregateRating: 0 });
        }
  
        const currentData = movieRatingsMap.get(movieId);
        const newVoteCount = currentData.voteCount + 1;
        const newAggregateRating =
          (currentData.aggregateRating * currentData.voteCount + rating) / newVoteCount;
        movieRatingsMap.set(movieId, {
          voteCount: newVoteCount,
          aggregateRating: parseFloat(newAggregateRating.toFixed(2)),
        });
      });
      const updatedMovies = [];
      const missingMovies = [];
  
      for (const [movieId, { voteCount, aggregateRating }] of movieRatingsMap.entries()) {
        const movieRef = doc(moviesCollection, movieId); 
        const movieDoc = await getDoc(movieRef);
        if (movieDoc.exists()) {
          await updateDoc(movieRef, {
            "ratingsSummary.aggregateRating": aggregateRating,
            "ratingsSummary.voteCount": voteCount,
          });
          updatedMovies.push(movieId);
        } else {
          missingMovies.push(movieId);
        }
      }
      res.status(200).json({
        message: "Movies database updated successfully",
        updatedMovies,
        missingMovies,
      });
    } catch (e) {
      console.error("Error managing reviews and updating movies:", e);
      res.status(500).json({ error: e.message });
    }
  }
const reviews=async (req, res) => {
    try {
      const reviewData = req.body;
      const newReviewRef = doc(ReviewsCollection);
      await setDoc(newReviewRef, reviewData);
      res.status(201).json({
        message: "Review created successfully",
        id: newReviewRef.id
      });
    } catch (e) {
      res.status(500).json({ error: e.message, message: "Server down" });
    }
  }
const reviewsarray=async (req, res) => {
    try {
      const reviewData = req.body;
      const data=[];
      reviewData.forEach(async (review) => {
        const newReviewRef = doc(ReviewsCollection);
        await setDoc(newReviewRef, review);
        data.push({ReviewId:newReviewRef.id,"Success":true});});
      res.status(201).json({data:data,givenmovieData:reviewData});
    } catch (e) {
      res.status(500).json({ error: e.message, message: "Server down" });
    }
  }
  const reviewmovieid= async (req, res) => {
    try {
      const { id, Movieid } = req.params;
      const updateData = req.body;
      const reviewsQuery = query(ReviewsCollection,where("id", "==", id),where("movieId", "==", Movieid));
      const querySnapshot = await getDocs(reviewsQuery);
      if (querySnapshot.empty) {return res.status(404).json({ message: "Review not found" });}
      const reviewDocRef = querySnapshot.docs[0].ref;
      await updateDoc(reviewDocRef, updateData);
      res.status(200).json({ message: "Review updated successfully" });
    } catch (e) {
      res.status(500).json({ error: e.message, message: "Server down" });
    }
  }
const deletereviewidmovie= async (req, res) => {
    try {
      const { id,Movieid } = req.params;
      const reviewRef = query(ReviewsCollection,where("id", "==", id),where("movieId", "==", Movieid));
      await deleteDoc(reviewRef);
      res.status(200).json({message: "Review deleted successfully"});
    } catch (e) {
      res.status(500).json({ error: e.message, message: "Server down" });
    }
  }
const reviewid=async (req, res) => {
    try {
      const { id } = req.params;
      const reviewRef = query(ReviewsCollection, where("movieId", "==", id));
      const reviewSnapshot = await getDocs(reviewRef);
      if (reviewSnapshot.empty) { return res.status(404).json({ message: "Review not found" });}
      const reviews = reviewSnapshot.docs.map((doc) => ({...doc.data(),MAINID:doc.id}));
      res.status(200).json({message: "Review(s) fetched successfully",data: reviews,});
    } catch (e) {
      res.status(500).json({ error: e.message, message: "Server down" });
    }
  }
module.exports = {
    reviewemailid,
    reviewemail,
    manageReview,
    reviews,
    reviewsarray,
    reviewmovieid,
    deletereviewidmovie,
    reviewid,
};
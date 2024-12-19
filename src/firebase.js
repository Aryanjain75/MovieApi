const { initializeApp } = require("firebase/app");
const { getAnalytics, isSupported } = require("firebase/analytics");
const { getFirestore } = require("firebase/firestore");
const dotenv = require("dotenv");
dotenv.config();
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGEINGSENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MESURMENTID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let analytics = null;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized successfully");
    } else {
      console.warn("Firebase Analytics is not supported in this environment");
    }
  })
  .catch((error) => {
    console.error("Error checking analytics support:", error);
  });

module.exports = { app, db, analytics };

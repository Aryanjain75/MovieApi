const express = require("express");
const Router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { db } = require("../firebase");
const {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} = require("firebase/firestore");

dotenv.config();

const usersCollection = () => collection(db, "Users");
const tokensCollection = () => collection(db, "Tokens"); // For storing tokens

// Middleware for authentication
const authenticate = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1]; // Extract token from header
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenDocRef = doc(tokensCollection(), decoded.id);
    const tokenDocSnap = await getDoc(tokenDocRef);
    if (!tokenDocSnap.exists() || tokenDocSnap.data().token !== token) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  } catch (e) {
    res.status(403).json({ message: "Invalid token", error: e.message });
  }
};

// Login route
Router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const userDocRef = doc(usersCollection(), email);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userDocSnap.data();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await setDoc(doc(tokensCollection(), email), { token, createdAt: new Date() });
    res.status(200).json({ message: "Login successful", data: user, token });
  } catch (e) {
    res
      .status(500)
      .json({ error: e.message, message: "Server down, Authentication failed" });
  }
});

// Signup route
Router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const userDocRef = doc(usersCollection(), email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return res.status(409).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(userDocRef, newUser);
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (e) {
    res
      .status(500)
      .json({ error: e.message, message: "Server down, Authentication failed" });
  }
});

// Forget Password route
Router.put("/forgetPassword", async (req, res) => {
  try {
    const { email, password } = req?.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const userDocRef = doc(usersCollection(), email);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await updateDoc(userDocRef, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (e) {
    res
      .status(500)
      .json({ error: e.message, message: "Server down, Authentication failed" });
  }
});

// Get user details route
Router.get("/getDetails", authenticate, async (req, res) => {
  try {
    const userDocRef = doc(usersCollection(), req?.user?.id);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userDocSnap.data();
    res.status(200).json({ message: "User details retrieved", data: user });
  } catch (e) {
    res
      .status(500)
      .json({ error: e.message, message: "Server down, Authentication failed" });
  }
});

// Logout route
Router.post("/logout", async (req, res) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenDocRef = doc(tokensCollection(), decoded.id);
    await setDoc(tokenDocRef, { token: null }); // Invalidate token
    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    res.status(500).json({ error: e.message, message: "Logout failed" });
  }
});

module.exports = Router;

const usersCollection = () => collection(db, "Users");
const tokensCollection = () => collection(db, "Tokens");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { db } = require("../firebase");
dotenv.config();
const {collection,doc,setDoc,getDoc,updateDoc,} = require("firebase/firestore");
const validateToken = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenDocRef = doc(tokensCollection(), decoded.id);
    const tokenDocSnap = await getDoc(tokenDocRef);
    if (!tokenDocSnap.exists() || tokenDocSnap.data().token !== token) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = { id: decoded.id, name: tokenDocSnap.data().name };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token", error: err.message });
  }
};
const login = async (req, res) => {
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
    const token = jwt.sign({ id: email,name:user.name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await setDoc(doc(tokensCollection(), email), { token, createdAt: new Date() });
    res.status(200).setHeader("authorization",token).json({ message: "Login successful", data: user, token });
  } catch (e) {
    res.status(500).json({ error: e.message, message: "Server down, Authentication failed" });
  }
}

const signup = async (req, res) => {
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
    res.status(500).json({ error: e.message, message: "Server down, Authentication failed" });
  }
};
const forgetPassword = async (req, res) => {
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
    res.status(500).json({ error: e.message, message: "Server down, Authentication failed" });
  }
}

const userDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDocRef = doc(usersCollection(), userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User details retrieved", data: userDocSnap.data() });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
}

const logout = async (req, res) => {
  try {
    const {token} = req?.body;
    if (!token) {return res.status(400).json({ message: "No token provided" });}
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenDocRef = doc(tokensCollection(), decoded.id);
    await setDoc(tokenDocRef, { token: null });
    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    res.status(500).json({ error: e.message, message: "Logout failed" });
  }
}

module.exports = {signup,login,validateToken,forgetPassword,userDetails,logout};

const express = require("express");
const Router = express.Router();
const bcrypt=require("bcryptjs");
const { db } = require("../firebase"); 
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } = require("firebase/firestore");
const jwt =require( 'jsonwebtoken');
const moviesCollection = collection(db, "Users");
const dotenv = require("dotenv");
dotenv.config();
Router.get("/Login",async (req,res)=>{
try{
    const {email, password}=req.body;
    if(!email || !password)
    {
        return res.status(400).json({message:"Please fill all the fields"});
    }
    const userDocRef = doc(moviesCollection, email);
    const userDocSnap=await getDoc(userDocRef);
    if(!userDocSnap.exists())
    {
        return res.status(404).json({message:"User not found"});
    }
    const user=userDocSnap.data();
    const isMatch=await bcrypt.compare(password, user.password);
    if(!isMatch)
    {
        return res.status(400).json({message:"Invalid credentials"});
    }
    res.status(200).json({message:"Login successful", data:user});
    const token=jwt.sign({id:userDocSnap.id}, process.env.JWT_SECRET);
    res.status(200).cookie(
        "token",
        token,
        {
            httpOnly:true,
            expires:new Date(Date.now()+24*60*60*1000)
        }
    ).
    json({message:"Login successful", data:user, token});
}catch(e)
{
    res.status(500).json({error:e.message,message:"Server down,Authentication failed"});
}
});
Router.post("/signup",async(req, res)=>{

    try{
        const {email, password, name}=req.body;
        if(!email || !password || !name)
        {
            return res.status(400).json({message:"Please fill all the fields"});
        }
        const userDocRef = doc(moviesCollection, email);
        const userDocSnap=await getDoc(userDocRef);
        if(userDocSnap.exists())
        {
            return res.status(409).json({message:"User already exists"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);
        const newUser={
            email,
            password:hashedPassword,
            name,
            createdAt:new Date(),
            updatedAt:new Date(),
        };
        await setDoc(userDocRef, newUser);
        res.status(201).json({message:"User created successfully", data:newUser});
    }catch(e)
    {
        res.status(500).json({error:e.message,message:"Server down,Authentication failed"});
    }
});
Router.put("/forgetPassword",async(req,res)=>{
    try{
        const {email, password}=req.body;
        if(!email || !password)
        {
            return res.status(400).json({message:"Please fill all the fields"});
        }
        const userDocRef = doc(moviesCollection, email);
        const userDocSnap=await getDoc(userDocRef);
        if(!userDocSnap.exists())
        {
            return res.status(404).json({message:"User not found"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);
        const updatedUser={
            email,
            password:hashedPassword,
            updatedAt:new Date(),
        };
        await updateDoc(userDocRef, updatedUser);
        res.status(200).json({message:"Password updated successfully", data:updatedUser});
    }catch(e)
    {
        res.status(500).json({error:e.message,message:"Server down,Authentication failed"});
    }
});
module.exports=Router;
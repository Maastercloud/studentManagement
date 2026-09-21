import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {fileURLToPath} from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config();
import pkg from "pg";
const app = express();
const port = 5000;
const {Pool} = pkg;
app.use(express.json())
app.use(express.static(__dirname + "/public"));

function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        console.log(authHeader);
        
        return res.status(401).json({message: "Invalid information provided"})
    }
    const token = authHeader.split(" ")[1];
    console.log(token);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({message: "Invalid token or token expired"})
    }
    
    
}
function requireAdmin(req, res, next){
    if(req.user?.role !== 'admin'){
       return res.status(403).json({message: "Forbidden"})
    }
    next();
}
// app.use(express.urlencoded({extended: true}));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
app.post("/api/signup", async(req, res)=>{
try {
    
    const email = req.body["email"];
    const password = req.body["password"];
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query("INSERT INTO users(email, password, role) VALUES($1, $2, 'student') RETURNING id, email", [email, hashedPassword]);
    res.json(result.rows)
    console.log(result.rows);
    
} catch (err) {
    if(err.code == '23505'){
        res.status(409).json({message: "Email already in use"});
    }
    console.log(err);
    
    res.status(500).json({message: "Server error"});
}
})
app.get("/api/signup", (req, res)=>{
    res.sendFile(__dirname + "/public/signup.html")
})
app.get("/api/login.html", (req, res)=>{
    res.sendFile(__dirname + "/public/login.html")
})
app.post("/api/login", async(req, res)=>{
    try {
        const {email, password} = req.body;
        const result = await pool.query("SELECT id, email, password, role FROM users WHERE email = $1", [email]);
        if(result.rows.length==0){
           return res.status(401).json({message: "Invalid details"});
        }
        const user = result.rows[0]
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
           return res.status(401).json({message: "Invalid credentials"})
        }
        const token = jwt.sign({
            id:user.id, email:user.email, role:user.role
        }, process.env.JWT_SECRET, {expiresIn: "1h"});
       return res.json({token, role:user.role, email: user.email})
        // res.send("User is active")
    } catch (err) {
        console.log(err);
        
        res.status(500).json({message: "Server error"})
    }
})
app.get("/api/myUsers", async(req, res)=>{
    try {
        const result = await pool.query("SELECT * FROM users")
        res.send(result.rows)
    } catch (err) {
        console.log(err);
        
        res.status(501).send("server error")
    }
})

app.get("/api/dashboard", authMiddleware, (req, res)=>{
    return res.json({message:`Welcome ${req.user.role} ${req.user.email}`})
})
app.get("/api/admin/dashboard", authMiddleware, requireAdmin, (req, res)=>{
   return res.json({message:`Welcome admin ${req.user.email}`})
})
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/public/landingpage.html")
})
app.listen(port, ()=>{
    console.log("server started on port 5000");   
})
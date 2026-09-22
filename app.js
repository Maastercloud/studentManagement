import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer"
import * as XLSX from "xlsx"
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

const upload = multer({storage: multer.memoryStorage()});

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
app.get("/signup", (req, res)=>{
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
app.get("/api/admin/students", authMiddleware, requireAdmin, async (req, res)=>{
    try{
    const result = await pool.query("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows)
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server error"});
        
    }
});
app.post("/api/admin/promote", authMiddleware, requireAdmin, async(req, res)=>{
    try {
        const {email, password} = req.body;
        if(!["email", "student"].includes(role)){
            return res.status(401).json({message: "Invalid role"});
        }
        const result = await pool.query("UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role", [role, email])
        if(result.rows.length === 0){
            return res.status(404).json({message: "User not found"});
        }
        res.json(result.rows[0])
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Server error"});
    }
})
app.get("/api/admin/stats", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const totalStudents = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const totalResults = await pool.query("SELECT COUNT(*) FROM results");
    const avgScore = await pool.query("SELECT AVG(score) FROM results");

    res.json({
      totalStudents: Number(totalStudents.rows[0].count),
      totalResults: Number(totalResults.rows[0].count),
      avgScore: avgScore.rows[0].avg ? Number(avgScore.rows[0].avg).toFixed(1) : null
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/admin/upload-results", authMiddleware, requireAdmin, upload.single("sheet"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse the uploaded file straight from memory
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    // rows now looks like:
    // [{ email: "a@x.com", course: "CS201", assessment: "Midterm", score: 88 }, ...]

    let inserted = 0;
    const errors = [];

    for (const row of rows) {
      const { email, course, assessment, score } = row;

      if (!email || !course || !assessment || score === undefined) {
        errors.push({ row, reason: "Missing required field" });
        continue;
      }

      const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

      if (userResult.rows.length === 0) {
        errors.push({ row, reason: "No student found with this email" });
        continue;
      }

      const studentId = userResult.rows[0].id;

      await pool.query(
        "INSERT INTO results(student_id, course, assessment, score) VALUES($1, $2, $3, $4)",
        [studentId, course, assessment, score]
      );
      inserted++;
    }

    res.json({ message: `Imported ${inserted} results`, inserted, skipped: errors.length, errors });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/admin/download-template", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT email FROM users WHERE role = 'student' ORDER BY email");

    const rows = result.rows.map(r => ({
      email: r.email,
      course: "",
      assessment: "",
      score: ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 10 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=results_template.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/results", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT course, assessment, score FROM results WHERE student_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.listen(port, ()=>{
    console.log("server started on port 5000");   
})
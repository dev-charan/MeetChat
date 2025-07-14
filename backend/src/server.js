import express from "express"
import dotenv from "dotenv"

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";

import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
app.use(cors({
    origin:"https://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

dotenv.config();
connectDB();
const PORT = process.env.PORT



app.use("/api/auth",authRoute)
app.use("/api/users",userRoute)
app.listen(PORT,()=>{
    console.log(`server started${PORT}`);
})
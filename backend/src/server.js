import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

const app = express()
dotenv.config();
connectDB();
const PORT = process.env.PORT



app.use("/api/auth",authRoute)
app.listen(PORT,()=>{
    console.log(`server started${PORT}`);
})
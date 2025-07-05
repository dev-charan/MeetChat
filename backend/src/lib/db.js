import mongoose from "mongoose"

export const connectDB= async()=>{
try {
     const conn=mongoose.connect(process.env.MONGODB_CONNECTION);
     console.log("DB connection done");
     
} catch (error) {
    console.log("connection error");
    process.exit(1)
}
}
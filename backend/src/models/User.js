import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userScheema= new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    bio:{
        type:String,
        default:""
    },
    profilePic:{
        type:String,
        default:""
    },
    nativelang:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:"",
    },
    isOnboarded:{
        type:Boolean,
        default:false
    },
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
},{timestamps:true})


userScheema.pre("save",async function (next){
    if(!this.isModified("password"))return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt)
        next();
    } catch (error) {
        next(error)
    }
})

userScheema.methods.matchPassword = async function(password){
    const isPassword  = await bcrypt.compare(password,this.password)
    return isPassword
}
const User = mongoose.model("User",userScheema)

//pre hook
//to hash the password

export default User;
import express from "express";
import cors from "cors"
import Welcome from "./controllers/welcome.js";


import dotenv from "dotenv"

import mongoose from "mongoose";
import signup from './routes/register.js'
import signin from './routes/signin.js'



const app=express();
app.use(cors())




app.get("/api/v1",Welcome)



app.use("/api/v1/signup",signup)
app.use("/api/v1",signin)

dotenv.config()

const connectTomongoDb=()=>{
    const mongoURI=process.env.MONGO_URI;
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    
    .then(()=>{
        console.log("mongodb connected")
    })
    .catch((err)=>{
        console.error("failed to connect to mongodb",err);
    })
}



const port=5300;
app.listen(port,()=>{
    console.log("your server has been started "+port);
    connectTomongoDb()
})

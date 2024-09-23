const express=require('express');
const mongoose=require('mongoose');
const app=express();
require('dotenv').config()
const bodyParser=require('body-parser');
app.use(bodyParser.json());//req body

//now importing router files
const userRoutes=require('./routes/userRoutes');
const candidatetRoutes=require('./routes/candidateRoutes');

//now using the routers
app.use('/user',userRoutes);
app.use('/candidate',candidatetRoutes);
//app.use('/candidate',candidateRouter)
app.listen(3000,()=>{
    console.log("server");
})
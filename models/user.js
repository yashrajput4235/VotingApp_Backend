const mongoose = require('mongoose');
const bcrypt=require('bcrypt');

// Defining User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter',
    },
    isVoted: {
        type: Boolean,
        default: false  // Corrected here
    }
});
userSchema.pre('save',async function(next){
    const person=this;
    // hash the password if only it has beeen modified
    if(!person.isModified('password'))return next();
    try{
        //hash password generation
        const salt=await bcrypt.genSalt(10);
        //hash password
        const hashedPassword=await bcrypt.hash(person.password,salt);
        //overide the plain password with the hash one
        person.password=hashedPassword;
        next();
    }
    catch(err){
        return next(err);
    }
})
userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        //use bcrypt to compare the provide password with the hashed password
        const isMatch=await bcrypt.compare(candidatePassword,this.password);
        return isMatch;
    }
    catch(err){
        throw(err);
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;

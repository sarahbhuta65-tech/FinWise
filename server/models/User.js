const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
    },

    password: {
        type: String,
        default: null,
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },

    number:{
        type:String,
        default:"",
    },

    occupation:{
        type:String,
        default:"",
    },

    city:{
        type:String,
        default:"",
    },

    dob:{
        type:String,
        default:"",
    },

    bio:{
        type:String,
        default:"",
    },

    profilePicture:{
        type:String,
        default:"",
    }

},
{
    timestamps:true,
}
);

module.exports = mongoose.model("User",userSchema);
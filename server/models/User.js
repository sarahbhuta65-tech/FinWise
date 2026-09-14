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

    isAdmin: {
        type: Boolean,
        default: false,
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
    },
    gmailRefreshToken: {
        type: String,
        default: null,
    },

    subscription: {
        plan: {
            type: String,
            enum: ["free", "premium"],
            default: "free",
        },

        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "cancelled", "expired", "pending"],
            default: "active",
        },

        razorpaySubscriptionId: {
            type: String,
            default: null,
        },

        startDate: {
            type: Date,
            default: null,
        },

        endDate: {
            type: Date,
            default: null,
        },

        currentPeriodEnd: {
            type: Date,
            default: null,
        },

        cancelAtPeriodEnd: {
            type: Boolean,
            default: false,
        },
    },
    aiUsage: {
        count: {
            type: Number,
            default: 0,
        },

        month: {
            type: Number,
            default: null,
        },

        year: {
            type: Number,
            default: null,
        },
    },
},
{
    timestamps:true,
}
);

module.exports = mongoose.model("User",userSchema);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Plan = require("../models/Plan");

const seedData = [
    {
        billingCycle: "monthly",
        name: "Premium Monthly",
        price: 149,
        description: "Full access to premium analytics, AI insights, and reports, billed monthly.",
        features: [
            "Advanced financial insights",
            "Premium financial tools",
            "Detailed analytics",
            "Enhanced planning experience",
        ],
    },
    {
        billingCycle: "yearly",
        name: "Premium Yearly",
        price: 1499,
        description: "Full access to premium analytics, AI insights, and reports, billed yearly — best value.",
        features: [
            "Advanced financial insights",
            "Premium financial tools",
            "Detailed analytics",
            "Enhanced planning experience",
        ],
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    for (const plan of seedData) {
        await Plan.findOneAndUpdate(
            { billingCycle: plan.billingCycle },
            plan,
            { upsert: true, new: true }
        );
    }
    console.log("Plans seeded successfully.");
    await mongoose.disconnect();
}

seed();
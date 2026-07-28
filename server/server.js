const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const goalRoutes = require("./routes/goalRoutes");
const sipRoutes = require("./routes/sipRoutes");
const emiRoutes = require("./routes/emiRoutes");
const blogRoutes = require("./routes/blogRoutes");
const faqRoutes = require("./routes/faqRoutes");
const aiRoutes = require("./routes/aiRoutes");

const path = require("path");
console.log("Mongo URI:", process.env.MONGO_URI);
connectDB();

const app = express();


//Middleware
app.use(cors());
app.use(express.json());
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/sip", sipRoutes);
app.use("/api/emi", emiRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/ai", aiRoutes);

//Test route
app.get("/", (req, res) => {
    res.send("Finwise backend running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

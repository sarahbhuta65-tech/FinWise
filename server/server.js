const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const goalRoutes = require("./routes/goalRoutes");
const sipRoutes = require("./routes/sipRoutes");
const emiRoutes = require("./routes/emiRoutes");
const blogRoutes = require("./routes/blogRoutes");
const faqRoutes = require("./routes/faqRoutes");
const aiRoutes = require("./routes/aiRoutes");
const financialSummaryRoutes = require("./routes/financialSummaryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const financialNudgeRoutes = require("./routes/financialNudgeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const testRoutes = require("./routes/testRoutes");
const premiumTestRoutes = require("./routes/premiumTestRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const premiumRoutes = require("./routes/premiumRoutes");
const gmailRoutes = require("./routes/gmailRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

console.log("Mongo URI:", process.env.MONGO_URI);
connectDB();

const app = express();

// Webhook must be mounted BEFORE express.json() — Razorpay's signature check needs the raw body
app.use("/api/webhooks/razorpay", require("./routes/razorpayWebhook"));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/sip", sipRoutes);
app.use("/api/emi", emiRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/financial-summary", financialSummaryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/financial-nudges", financialNudgeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/test", testRoutes);
app.use("/api/premium-test", premiumTestRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/admin/subscriptions", require("./routes/adminSubscriptions"));
app.use("/api/admin/users", require("./routes/adminUsers"));
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/plans", require("./routes/planRoutes"));
app.use("/api/admin/activity", require("./routes/adminActivity"));

// Test route
app.get("/", (req, res) => {
    res.send("Finwise backend running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
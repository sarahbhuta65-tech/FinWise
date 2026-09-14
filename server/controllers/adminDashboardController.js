const User = require("../models/User");

const getDashboardStats = async (req, res) => {
    try {
        // Exclude admin accounts from customer statistics
        const userFilter = {
            isAdmin: false,
        };

        // Total users
        const totalUsers = await User.countDocuments(userFilter);

        // Current month
        const now = new Date();

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const newUsersThisMonth = await User.countDocuments({
            ...userFilter,
            createdAt: {
                $gte: startOfMonth,
            },
        });

        // Active premium subscribers
        const premiumFilter = {
            ...userFilter,
            "subscription.plan": "premium",
            "subscription.status": "active",
        };

        const premiumSubscribers = await User.countDocuments(
            premiumFilter
        );

        // Monthly subscribers
        const monthlySubscribers = await User.countDocuments({
            ...premiumFilter,
            "subscription.billingCycle": "monthly",
        });

        // Yearly subscribers
        const yearlySubscribers = await User.countDocuments({
            ...premiumFilter,
            "subscription.billingCycle": "yearly",
        });

        // FinWise subscription prices
        const MONTHLY_PRICE = 149;
        const YEARLY_PRICE = 1499;

        // Estimated Monthly Recurring Revenue
        const monthlyRevenue =
            (monthlySubscribers * MONTHLY_PRICE) +
            (yearlySubscribers * (YEARLY_PRICE / 12));

        res.json({
            success: true,

            stats: {
                totalUsers,
                newUsersThisMonth,
                premiumSubscribers,
                monthlyRevenue: Math.round(monthlyRevenue),
            },

            planBreakdown: {
                monthly: {
                    users: monthlySubscribers,
                    revenue: monthlySubscribers * MONTHLY_PRICE,
                },

                yearly: {
                    users: yearlySubscribers,
                    revenue: yearlySubscribers * YEARLY_PRICE,
                },

                free: {
                    users: totalUsers - premiumSubscribers,
                    revenue: 0,
                },
            },
        });

    } catch (error) {
        console.error(
            "Admin dashboard stats error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = {
    getDashboardStats,
};
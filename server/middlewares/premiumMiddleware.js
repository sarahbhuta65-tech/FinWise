const User = require("../models/User");

const premiumMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPremium =
            user.subscription?.plan === "premium" &&
            user.subscription?.status === "active";

        if (!isPremium) {
            return res.status(403).json({
                success: false,
                message: "Premium subscription required",
            });
        }

        next();

    } catch (error) {
        console.error("Premium Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify subscription",
        });
    }
};

module.exports = premiumMiddleware;
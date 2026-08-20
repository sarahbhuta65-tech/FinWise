export const generateFinancialNudges = ({
    totalExpenses = 0,
    monthlyEmi = 0,
    goalData = null,
    healthScore = 100,
    thisMonthSpent = 0,
    lastMonthSpent = 0,
    chartData = [],
}) => {
    const nudges = [];

    // ==========================================
    // 1. SAVINGS GOAL NUDGE
    // ==========================================

    if (goalData) {
        const progress = Number(goalData.progress || 0);

        if (progress < 40) {
            nudges.push({
                id: "goal-low",
                priority: 100,
                type: "goal",
                icon: "✦",
                label: "FINANCIAL NUDGE",
                title: "Your goal needs attention",
                message: `You're still below 40% of your savings goal. A small increase in monthly savings could help you catch up.`,
                action: "VIEW SAVINGS GOAL",
                actionPath: "/goal",
            });
        } else if (progress >= 100) {
            nudges.push({
                id: "goal-complete",
                priority: 95,
                type: "success",
                icon: "✓",
                label: "FINANCIAL NUDGE",
                title: "Savings goal achieved",
                message: `You've reached your ${goalData.goalName || "savings"} goal. Great work staying consistent.`,
                action: "VIEW SAVINGS GOAL",
                actionPath: "/goal",
            });
        } else if (progress < 70) {
            nudges.push({
                id: "goal-progress",
                priority: 70,
                type: "goal",
                icon: "✦",
                label: "FINANCIAL NUDGE",
                title: "Keep your savings moving",
                message: `You're ${Math.round(progress)}% through your savings goal. Staying consistent will keep you on track.`,
                action: "VIEW SAVINGS GOAL",
                actionPath: "/goal",
            });
        }
    }


    // ==========================================
    // 2. EXPENSE NUDGE
    // ==========================================

    if (totalExpenses > 15000) {
        nudges.push({
            id: "high-expenses",
            priority: 90,
            type: "warning",
            icon: "!",
            label: "FINANCIAL NUDGE",
            title: "Spending is running high",
            message: `You've spent ₹${Number(
                totalExpenses
            ).toLocaleString("en-IN")} so far. Consider reducing non-essential expenses.`,
            action: "VIEW EXPENSES",
            actionPath: "/expense",
        });
    }


    // ==========================================
    // 3. TOP SPENDING CATEGORY
    // ==========================================

    if (chartData.length > 0) {
        const highestCategory = [...chartData].sort(
            (a, b) => Number(b.value) - Number(a.value)
        )[0];

        if (highestCategory && Number(highestCategory.value) > 0) {
            const percentage =
                totalExpenses > 0
                    ? (Number(highestCategory.value) /
                          Number(totalExpenses)) *
                      100
                    : 0;

            if (percentage >= 40) {
                nudges.push({
                    id: "category-heavy",
                    priority: 80,
                    type: "warning",
                    icon: "↗",
                    label: "FINANCIAL NUDGE",
                    title: `${highestCategory.name} is taking the lead`,
                    message: `${highestCategory.name} accounts for ${Math.round(
                        percentage
                    )}% of your spending this period.`,
                    action: "ANALYZE EXPENSES",
                    actionPath: "/expense",
                });
            }
        }
    }


    // ==========================================
    // 4. EMI NUDGE
    // ==========================================

    if (Number(monthlyEmi) > 20000) {
        nudges.push({
            id: "high-emi",
            priority: 85,
            type: "warning",
            icon: "₹",
            label: "FINANCIAL NUDGE",
            title: "Your EMI is significant",
            message: `Your monthly EMI is ₹${Number(
                monthlyEmi
            ).toLocaleString("en-IN")}. Keeping other spending controlled can protect your monthly cash flow.`,
            action: "VIEW EMI",
            actionPath: "/emi",
        });
    }


    // ==========================================
    // 5. SPENDING INCREASE NUDGE
    // ==========================================

    if (
        Number(lastMonthSpent) > 0 &&
        Number(thisMonthSpent) > Number(lastMonthSpent) * 1.2
    ) {
        const increase =
            ((Number(thisMonthSpent) - Number(lastMonthSpent)) /
                Number(lastMonthSpent)) *
            100;

        nudges.push({
            id: "spending-increase",
            priority: 88,
            type: "warning",
            icon: "↗",
            label: "FINANCIAL NUDGE",
            title: "Your spending has increased",
            message: `Your spending is up by ${Math.round(
                increase
            )}% compared with last month.`,
            action: "COMPARE SPENDING",
            actionPath: "/expense",
        });
    }


    // ==========================================
    // 6. HEALTH SCORE NUDGE
    // ==========================================

    if (Number(healthScore) < 60) {
        nudges.push({
            id: "health-low",
            priority: 92,
            type: "warning",
            icon: "!",
            label: "FINANCIAL NUDGE",
            title: "Your financial health needs attention",
            message:
                "Your current financial health score suggests that controlling expenses and improving savings could help.",
            action: "VIEW FINANCIAL HEALTH",
            actionPath: "/dashboard",
        });
    }


    // ==========================================
    // 7. POSITIVE NUDGE
    // ==========================================

    if (nudges.length === 0 && Number(healthScore) >= 80) {
        nudges.push({
            id: "healthy-finances",
            priority: 50,
            type: "success",
            icon: "✦",
            label: "FINANCIAL NUDGE",
            title: "You're doing great",
            message:
                "Your finances are looking healthy. Keep maintaining your current spending and saving habits.",
            action: "VIEW DASHBOARD",
            actionPath: "/dashboard",
        });
    }


    // ==========================================
    // SORT BY PRIORITY
    // ==========================================

    return nudges.sort(
        (a, b) => b.priority - a.priority
    );
};
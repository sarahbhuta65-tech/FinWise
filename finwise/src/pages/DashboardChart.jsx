import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

import "./Admin.css";

function DashboardChart({ blogs, faqs }) {

    const data = [
        {
            name: "Blogs",
            total: blogs.length,
        },
        {
            name: "FAQs",
            total: faqs.length,
        },
    ];

    return (
        <div className="chart-card">

            <h2>Content Overview</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>

                    <CartesianGrid
                        stroke="var(--admin-line-strong)"
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="name"
                        tick={{ fill: "var(--admin-muted)", fontSize: 13 }}
                        axisLine={{ stroke: "var(--admin-line-strong)" }}
                        tickLine={{ stroke: "var(--admin-line-strong)" }}
                    />

                    <YAxis
                        tick={{ fill: "var(--admin-muted)", fontSize: 13 }}
                        axisLine={{ stroke: "var(--admin-line-strong)" }}
                        tickLine={{ stroke: "var(--admin-line-strong)" }}
                    />

                    <Tooltip
                        contentStyle={{
                            border: "1px solid var(--admin-line)",
                            borderRadius: "4px",
                            background: "var(--admin-surface)",
                            color: "var(--admin-ink)",
                        }}
                    />

                    <Bar
                        dataKey="total"
                        fill="var(--admin-accent)"
                        radius={[6, 6, 0, 0]}
                    />

                </BarChart>
            </ResponsiveContainer>

        </div>
    );
}

export default DashboardChart;
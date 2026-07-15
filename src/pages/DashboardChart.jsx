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

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="total"
                        radius={[8,8,0,0]}
                    />

                </BarChart>
            </ResponsiveContainer>

        </div>
    );
}

export default DashboardChart;
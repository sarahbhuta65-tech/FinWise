import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function TrendTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="trend-tooltip">
            <span className="trend-tooltip-month">{label}</span>
            <span className="trend-tooltip-value">{payload[0].value} signups</span>
        </div>
    );
}

function SignupsTrendChart({ data, loading }) {
    if (loading) {
        return <div className="chart-placeholder">Loading trend…</div>;
    }

    if (!data || data.every((point) => point.count === 0)) {
        return <div className="chart-placeholder">No signups recorded yet.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1f6d4c" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#1f6d4c" stopOpacity={0.02} />
                    </linearGradient>
                </defs>

                <CartesianGrid stroke="#e3ddcd" vertical={false} />

                <XAxis
                    dataKey="label"
                    tick={{ fill: "#68717d", fontSize: 11, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                    axisLine={{ stroke: "#e3ddcd" }}
                    tickLine={false}
                />

                <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#68717d", fontSize: 11, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                />

                <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#1f6d4c", strokeWidth: 1 }} />

                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#1f6d4c"
                    strokeWidth={2}
                    fill="url(#signupsFill)"
                    dot={{ r: 3, fill: "#1f6d4c", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default SignupsTrendChart;
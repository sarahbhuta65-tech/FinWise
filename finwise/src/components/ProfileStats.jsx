import "./MyAccount.css";
import { FaWallet, FaMoneyBillWave, FaChartLine, FaFire } from "react-icons/fa";

function ProfileStats({
    totalSavings,
    totalExpenses,
    totalInvestment,
    loginStreak
}) {
    return (
        <div className="profile-stats">

            <div className="stat-card">
                <FaWallet className="stat-icon savings" />
                <h3>₹{totalSavings}</h3>
                <p>Total Savings</p>
            </div>

            <div className="stat-card">
                <FaMoneyBillWave className="stat-icon expenses" />
                <h3>₹ {totalExpenses}</h3>
                <p>Total Expenses</p>
            </div>

            <div className="stat-card">
                <FaChartLine className="stat-icon investment" />
                <h3>₹ {totalInvestment}</h3>
                <p>Total Investment</p>
            </div>

            <div className="stat-card">
                <FaFire className="stat-icon streak" />
                <h3>{loginStreak} Days</h3>
                <p>Login Streak</p>
            </div>

        </div>
    );
}

export default ProfileStats;
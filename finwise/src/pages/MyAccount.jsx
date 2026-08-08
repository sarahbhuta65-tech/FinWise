import { useState,useEffect } from "react";
import AccountHeader from "../components/AccountHeader";
import AccountSidebar from "../components/AccountSidebar";
import PersonalInfo from "../components/PersonalInfo";
import ProfileStats from "../components/ProfileStats";
import Appearance from "../components/Appearnace";
import Notifications from "../components/Notifications";
import Security from "../components/Security";
import Activity from "../components/Activity";
import About from "../components/About";
import Logout from "../components/Logout";
import Language from "../components/Language";
import axios from "axios";
import "../components/MyAccount.css";

function MyAccount({ darkMode, setDarkMode, setUser }) {
    const [activeSection, setActiveSection] = useState("personal");
    const [totalSavings, setTotalSavings] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalInvestment, setTotalInvestment] = useState(0);  
    const loadProfileStats = async () => {
        try{

            const user = JSON.parse(localStorage.getItem("user"));

            const [expenseRes, sipRes, goalRes] = await Promise.all([

                axios.get(`${import.meta.env.VITE_API_URL}/api/expenses/${user._id}`),

                axios.get(`${import.meta.env.VITE_API_URL}/api/sip/${user._id}`),

                axios.get(`${import.meta.env.VITE_API_URL}/api/goals/${user._id}`)

            ]);

            const expenses = Array.isArray(expenseRes.data)
                ? expenseRes.data
                : [];

            const sipData = sipRes.data;
            const sips = Array.isArray(sipData)
                ? sipData
                : sipData
                ? [sipData]
                : [];

            const goalData = goalRes.data;
            const goals = Array.isArray(goalData)
                ? goalData
                : goalData
                ? [goalData]
                : [];

            // Debugging: log shapes when unexpected
            // console.debug({ expenses, sips, goals });

            const expenseTotal = expenses.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );

            const investmentTotal = sips.reduce(
                (sum, item) =>
                    sum + Number(item.investedAmount || item.totalValue || 0),
                0
            );

            const savingsTotal = goals.reduce(
                (sum, item) => sum + Number(item.savedAmount || 0),
                0
            );

            setTotalExpenses(expenseTotal);
            setTotalInvestment(investmentTotal);
            setTotalSavings(savingsTotal);

        }
        catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        loadProfileStats();
    }, []);

    return(
        <div className="account-page">
            <AccountHeader setUser={setUser} />
            <ProfileStats
               totalSavings={totalSavings}
               totalExpenses={totalExpenses}
               totalInvestment={totalInvestment}
               loginStreak={7}
            />

            <div className="account-body">

                <AccountSidebar
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                />

                <div className="account-content">

                    {activeSection == "personal" && <PersonalInfo/>}

                    {activeSection === "security" && (<Security/>)}

                    {activeSection === "appearance" && (
                        <Appearance
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                        />
                    )}

                    {activeSection === "language" && (<Language />)}

                    {activeSection === "notifications" && <Notifications />}

                    {activeSection === "activity" && (
                        <Activity/>
                    )}

                    {activeSection === "about" && <About />}
                    {activeSection === "logout" && (
                        <Logout setUser={setUser} />
                    )}
                </div>  
            </div>

        </div>
    );
}

export default MyAccount;

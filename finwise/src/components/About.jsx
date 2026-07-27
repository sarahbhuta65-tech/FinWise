import "./MyAccount.css";

function About() {

    return (

        <div className="settings-card">

            <h2>ℹ️ About FinWise</h2>

            <div className="about-section">

                <h3>💡 Our Mission</h3>

                <p>
                    FinWise helps users manage savings, expenses,
                    SIP investments, EMI planning and financial
                    goals through one simple and user-friendly
                    platform.
                </p>

            </div>

            <div className="about-section">

                <h3>🚀 Features</h3>

                <ul>
                    <li>Expense Tracker</li>
                    <li>SIP Calculator</li>
                    <li>EMI Calculator</li>
                    <li>Savings Goal Tracker</li>
                    <li>Personal Finance Dashboard</li>
                    <li>Profile Management</li>
                </ul>

            </div>

            <div className="about-section">

                <h3>👩 Developer</h3>

                <p>
                    Sarah Bhuta
                    <br />
                    B.Tech Information Technology
                    <br />
                    P P Savani University
                </p>

            </div>

            <div className="version-box">

                Version 1.0.0

                <br />

                © 2026 FinWise

            </div>

        </div>

    );

}

export default About;
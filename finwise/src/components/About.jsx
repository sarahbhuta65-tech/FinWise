import "./MyAccount.css";

function About() {
    return (
        <div className="settings-card about-page">

            {/* Header */}
            <div className="about-header">
                <div>
                    <span className="account-eyebrow">
                        FINWISE PLATFORM
                    </span>

                    <h2>About FinWise</h2>

                    <p>
                        A smarter and simpler way to understand your personal finances.
                    </p>
                </div>

                <div className="about-header-icon">
                    ℹ️
                </div>
            </div>

            <div className="account-divider"></div>

            {/* Mission */}
            <div className="about-block mission-block">

                <div className="about-block-icon">
                    💡
                </div>

                <div>
                    <span className="account-eyebrow">
                        OUR MISSION
                    </span>

                    <h3>Making personal finance easier.</h3>

                    <p>
                        FinWise helps users manage savings, expenses,
                        SIP investments, EMI planning and financial
                        goals through one simple and user-friendly
                        platform.
                    </p>
                </div>

            </div>

            {/* Features */}
            <div className="about-features">

                <div className="about-section-title">
                    <span className="account-eyebrow">
                        WHAT YOU CAN DO
                    </span>

                    <h3>Built for everyday financial decisions.</h3>
                </div>

                <div className="feature-grid">

                    <div className="feature-item">
                        <span>💸</span>
                        <div>
                            <h4>Expense Tracker</h4>
                            <p>Keep track of where your money goes.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <span>📈</span>
                        <div>
                            <h4>SIP Calculator</h4>
                            <p>Plan and estimate your SIP investments.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <span>🏦</span>
                        <div>
                            <h4>EMI Calculator</h4>
                            <p>Understand your loan repayment plans.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <span>🎯</span>
                        <div>
                            <h4>Savings Goals</h4>
                            <p>Set goals and monitor your progress.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <span>📊</span>
                        <div>
                            <h4>Finance Dashboard</h4>
                            <p>See your financial information in one place.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <span>👤</span>
                        <div>
                            <h4>Profile Management</h4>
                            <p>Manage your personal account preferences.</p>
                        </div>
                    </div>

                </div>

            </div>

            {/* Developer */}
            <div className="developer-section">

                <div className="developer-avatar">
                    S
                </div>

                <div>
                    <span className="account-eyebrow">
                        DEVELOPED BY
                    </span>

                    <h3>Sarah Bhuta</h3>

                    <p>
                        B.Tech Information Technology
                        <br />
                        P P Savani University
                    </p>
                </div>

            </div>

            {/* Version */}
            <div className="version-box">
                <strong>FinWise</strong>
                <br />
                Version 1.0.0
                <br />
                © 2026 FinWise
            </div>

        </div>
    );
}

export default About;
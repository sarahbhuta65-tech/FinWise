import "./PrivacyPolicy.css";

function PrivacyPolicy() {
    return (
        <div className="privacy-policy-page">

            <div className="privacy-policy-container">

                <button
                    className="privacy-back-btn"
                    onClick={() => window.history.back()}
                >
                    ← Back
                </button>

                <span className="privacy-eyebrow">
                    FINWISE
                </span>

                <h1>Privacy Policy</h1>

                <p className="privacy-updated">
                    Last updated: August 31, 2026
                </p>

                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        FinWise is a personal finance application designed
                        to help users track expenses, manage savings goals,
                        plan investments, and understand their financial
                        activity.
                    </p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>
                    <p>
                        FinWise may collect information provided by users
                        when they create an account and use the application,
                        including account information, expense records,
                        savings goals, investment information, and other
                        financial information entered by the user.
                    </p>
                </section>

                <section>
                    <h2>3. Gmail Integration</h2>
                    <p>
                        FinWise may provide an optional Gmail integration
                        that allows users to connect their Gmail account
                        through Google's authorization system.
                    </p>

                    <p>
                        If a user grants permission, FinWise may access
                        relevant email messages to identify transaction
                        information such as transaction amount, merchant,
                        date, and related details.
                    </p>

                    <p>
                        FinWise does not request or access the user's Gmail
                        password. Gmail access is provided through Google's
                        OAuth authorization system and can be revoked by
                        the user at any time.
                    </p>
                </section>

                <section>
                    <h2>4. How We Use Information</h2>

                    <p>
                        Information collected through FinWise is used to:
                    </p>

                    <ul>
                        <li>Track and organize expenses.</li>
                        <li>Provide financial summaries and analytics.</li>
                        <li>Identify transaction information from connected email accounts.</li>
                        <li>Provide personalized financial insights.</li>
                        <li>Improve the functionality of the application.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Gmail Data</h2>

                    <p>
                        Gmail data accessed through the Gmail API is used
                        only for the purposes described above and only after
                        the user grants the required permission.
                    </p>

                    <p>
                        FinWise does not sell users' Gmail data or use Gmail
                        data for advertising purposes.
                    </p>
                </section>

                <section>
                    <h2>6. Data Security</h2>

                    <p>
                        FinWise takes reasonable measures to protect user
                        information and uses appropriate authentication and
                        authorization mechanisms to help protect account
                        data.
                    </p>
                </section>

                <section>
                    <h2>7. Third-Party Services</h2>

                    <p>
                        FinWise may use third-party services such as Google
                        APIs and payment providers to provide certain
                        application functionality.
                    </p>

                    <p>
                        These services may process information according to
                        their own privacy policies and terms.
                    </p>
                </section>

                <section>
                    <h2>8. User Control</h2>

                    <p>
                        Users can choose whether to connect optional
                        services such as Gmail. Users may also revoke Gmail
                        access through their Google account settings.
                    </p>
                </section>

                <section>
                    <h2>9. Changes to This Privacy Policy</h2>

                    <p>
                        This Privacy Policy may be updated from time to time
                        to reflect changes to FinWise or its services.
                        Updated versions will be published on this page.
                    </p>
                </section>

                <section>
                    <h2>10. Contact</h2>

                    <p>
                        If you have questions about this Privacy Policy or
                        FinWise's handling of information, you can contact
                        us at:
                    </p>

                    <p>
                        <strong>sarahbhuta65@gmail.com</strong>
                    </p>
                </section>

            </div>

        </div>
    );
}

export default PrivacyPolicy;
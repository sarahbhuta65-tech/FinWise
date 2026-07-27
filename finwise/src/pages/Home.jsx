import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero-section-home">
        <div className="hero-content">
          <h1>Manage Money Smarter 💰</h1>
          <p>
            Track expenses, calculate investments, and achieve financial goals
            with FinWise.
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate("/dashboard")}>
              Get Started
            </button>

            <button className="secondary-btn">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <h2>Our Features</h2>

        <div className="card-container">
          <div className="card" onClick={() => navigate("/sip")}>
            <h2>📈 SIP Calculator</h2>
            <p>Calculate investment returns</p>
          </div>

          <div className="card" onClick={() => navigate("/emi")}>
            <h2>💳 EMI Calculator</h2>
            <p>Calculate monthly EMI</p>
          </div>

          <div className="card" onClick={() => navigate("/expense")}>
            <h2>💸 Expense Tracker</h2>
            <p>Track spending habits</p>
          </div>

          <div className="card" onClick={() => navigate("/goal")}>
            <h2>🎯 Savings Goal</h2>
            <p>Track savings progress</p>
          </div>
        </div>
      </section>

      {/* WHY FINWISE */}
      <section className="why-section">
        <h2>Why Choose FinWise?</h2>

        <div className="why-grid">
          <div className="why-card">
            <h3>🤖 AI Insights</h3>
            <p>Get smart suggestions based on spending patterns.</p>
          </div>

          <div className="why-card">
            <h3>📊 Analytics</h3>
            <p>Visual charts help understand finances clearly.</p>
          </div>

          <div className="why-card">
            <h3>✨ Easy UI</h3>
            <p>Simple and beginner-friendly financial management.</p>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="preview-section">
        <div className="preview-card">
            <h2>📚 Financial Blogs</h2>
            <p>
            Read useful finance articles about SIP, EMI, savings and investing.
            </p>
            <button>Read Blogs</button>
        </div>

        <div className="preview-card">
            <h2>❓ FAQs</h2>
            <p>
            Have questions? Explore frequently asked questions about FinWise.
            </p>
            <button onClick={() => navigate("/faq")}>
            View FAQs
           </button>
        </div>
        </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <h3>FinWise</h3>
          <p>Smart finance for everyone.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          
          <span onClick={() => navigate("/blogs")} className="footer-link">
              Blogs
          </span>
          <br></br>

          <span onClick={() => navigate("/faq")} className="footer-link">
              FAQs
          </span>

          <p>About Us</p>
        </div>

        <div>
          <h4>Contact</h4>
          <p>finwise@gmail.com</p>
          <p>+91 XXXXX XXXXX</p>
        </div>

        <div className="copyright">
          © 2026 FinWise. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
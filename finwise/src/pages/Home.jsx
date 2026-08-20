import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home({ darkMode }) {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`home-page${darkMode ? " dark" : ""}`}>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-pill">AI-powered personal finance</span>
          <h1>
            Manage your money with <strong>clarity</strong> and <strong>confidence</strong>.
          </h1>
          <p>
            FinWise brings smart expense tracking, savings goals, and investment guidance together in one clear, connected ledger.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/dashboard")}>
              Start saving
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection("benefits")}>
              Explore features
            </button>
          </div>

          <div className="hero-highlights">
            <div>
              <strong className="mono-figure">24/7</strong>
              <span>AI insights</span>
            </div>
            <div>
              <strong className="mono-figure">3+</strong>
              <span>Core tools</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>By design</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="glass-card pulse-card">
            <div className="card-heading">
              <span>Portfolio</span>
              <strong className="mono-figure">₹45,000</strong>
            </div>
            <div className="card-chart">
              <div className="bar bar-1" />
              <div className="bar bar-2" />
              <div className="bar bar-3" />
              <div className="bar bar-4" />
              <div className="bar bar-5" />
            </div>
            <div className="card-footer">
              <span className="mono-figure">+18.2% this month</span>
              <span className="mono-figure">Goal progress 82%</span>
            </div>
          </div>

          <div className="hero-mini-grid">
            <div className="mini-chip">
              <span>💰</span>
              <p>Savings vault</p>
            </div>
            <div className="mini-chip">
              <span>💳</span>
              <p>EMI planner</p>
            </div>
            <div className="mini-chip">
              <span>📊</span>
              <p>Expense view</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits-panel" id="benefits">
        <div className="benefits-intro">
          <span>Designed for your best financial self</span>
          <h2>Simple, smart tools that feel premium.</h2>
        </div>

        <div className="benefit-cards">
          <article className="benefit-card">
            <h3>Personalized guidance</h3>
            <p>AI-powered insights help you make better savings and spending decisions.</p>
          </article>
          <article className="benefit-card">
            <h3>Modern dashboards</h3>
            <p>Clear visual summaries keep your financial picture organized.</p>
          </article>
          <article className="benefit-card">
            <h3>Goal-centered planning</h3>
            <p>Set targets and track progress with confidence.</p>
          </article>
        </div>
      </section>

      <section className="process-panel">
        <div className="process-intro">
          <span>How it works</span>
          <h2>Get started fast with 3 easy money steps.</h2>
        </div>

        <div className="process-cards">
          <article className="process-step">
            <div className="step-icon">01</div>
            <h3>Connect your goals</h3>
            <p>Add your savings targets and choose the milestones that matter most.</p>
          </article>
          <article className="process-step">
            <div className="step-icon">02</div>
            <h3>Track spending</h3>
            <p>See your cash flow, recurring expenses, and habits in one clear ledger.</p>
          </article>
          <article className="process-step">
            <div className="step-icon">03</div>
            <h3>Save smarter</h3>
            <p>Use AI insights, calculators, and progress tracking to stay ahead.</p>
          </article>
        </div>
      </section>

      <section className="quick-links-panel">
        <div className="quick-link" onClick={() => navigate("/sip")}>
          <p>SIP Calculator</p>
          <span>Forecast your investment growth.</span>
        </div>
        <div className="quick-link" onClick={() => navigate("/emi")}>
          <p>EMI Calculator</p>
          <span>Compare monthly payment options.</span>
        </div>
        <div className="quick-link" onClick={() => navigate("/expense")}>
          <p>Expense Tracker</p>
          <span>Review spending habits instantly.</span>
        </div>
      </section>

      <section className="spotlight-panel">
        <div className="spotlight-card">
          <div className="spotlight-badge">All your planning in one place</div>
          <h3>One hub for smarter money decisions.</h3>
          <p>FinWise connects your goals, calculators, and spending insights in a single, connected ledger that feels clear and dependable.</p>
          <div className="spotlight-items">
            <span>Live goal progress</span>
            <span>Custom savings guidance</span>
            <span>Built-in expense review</span>
          </div>
        </div>
      </section>

      <section className="footer-panel">
        <div>
          <h3>FinWise</h3>
          <p>Modern finance tools for everyday goals.</p>
        </div>
        <div className="footer-links">
          <button onClick={() => navigate("/blogs")}>Blogs</button>
          <button onClick={() => navigate("/faq")}>FAQs</button>
          <button onClick={() => scrollToSection("benefits")}>Features</button>
        </div>
      </section>
    </div>
  );
}

export default Home;
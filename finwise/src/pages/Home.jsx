import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

function Home({ darkMode }) {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [plans, setPlans] = useState({});
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePayment = async () => {
      try {
          const token = localStorage.getItem("token");

          if (!token) {
              alert("Please login to continue.");
              return;
          }

            // 1. Create a recurring Razorpay subscription
          const res = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/payments/create-subscription`,
              { billingCycle },
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
          );

          if (!res.data.success) {
              alert("Unable to start Premium subscription.");
              return;
          }

          const subscription = res.data.subscription;

          // 2. Open Razorpay
          const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID,
              name: "FinWise",
              description: `FinWise Premium - ${billingCycle}`,
              subscription_id: subscription.id,

              handler: async function (response) {
                  try {
                      console.log("Payment successful:", response);

                        // 3. Verify the recurring subscription with backend
                      const verifyRes = await axios.post(
                          `${import.meta.env.VITE_API_URL}/api/payments/verify-subscription`,
                          {
                              razorpay_payment_id:
                                  response.razorpay_payment_id,
                            razorpay_subscription_id:
                              response.razorpay_subscription_id,
                              razorpay_signature:
                                  response.razorpay_signature,
                            billingCycle,
                          },
                          {
                              headers: {
                                  Authorization: `Bearer ${token}`,
                              },
                          }
                      );

                      if (verifyRes.data.success) {
                        alert(
                            "Payment successful! You are now a Premium user."
                        );

                        console.log(
                            "Premium subscription:",
                            verifyRes.data.subscription
                        );

                        const currentUser = JSON.parse(
                            localStorage.getItem("user")
                        );

                        const updatedUser = {
                            ...currentUser,
                            subscription: verifyRes.data.subscription,
                        };

                        localStorage.setItem(
                            "user",
                            JSON.stringify(updatedUser)
                        );

                        window.location.reload();
                    }

                  } catch (error) {
                      console.error(
                          "Payment Verification Error:",
                          error
                      );

                      alert(
                          "Payment was completed, but verification failed."
                      );
                  }
              },

              prefill: {
                  name: "",
                  email: "",
                  contact: "",
              },

              theme: {
                  color: "#1f6d4c",
              },
          };

          const razorpay = new window.Razorpay(options);

          razorpay.open();

      } catch (error) {
          console.error("Payment Error:", error);

          if (error.response?.status === 401) {
              alert("Please login again.");
          } else {
              alert(
                  "Something went wrong while starting the payment."
              );
          }
      }
  };

  useEffect(() => {
      const fetchPlans = async () => {
          try {
              const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/plans`);
              const plansByCycle = {};
              (res.data.plans || []).forEach((p) => {
                  plansByCycle[p.billingCycle] = p;
              });
              setPlans(plansByCycle);
          } catch (error) {
              console.error("Failed to load plans:", error);
          }
      };
      fetchPlans();
  }, []);
  
  return (
    <div
      className={`home-page${darkMode ? " dark" : ""}${
        isLoaded ? " page-loaded" : ""
      }`}
    >
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

      <section className="premium-panel">
        <div className="premium-card">
          <div className="premium-content">
            <span className="premium-badge">FINWISE PREMIUM</span>

            <h2>Take your financial planning further.</h2>

            <p>
              Unlock advanced financial tools and insights designed to help
              you plan, track, and manage your money more effectively.
            </p>

            <div className="premium-features">
                {(plans[billingCycle]?.features || []).map((feature, i) => (
                    <span key={i}>✓ {feature}</span>
                ))}
            </div>

            <div className="premium-cycle-toggle" role="group" aria-label="Billing cycle">
              <button
                type="button"
                className={billingCycle === "monthly" ? "active" : ""}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                className={billingCycle === "yearly" ? "active" : ""}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
              </button>
            </div>

            <div className="premium-price">
                <strong>₹{plans[billingCycle]?.price ?? "—"}</strong>
                <span> / {billingCycle === "monthly" ? "month" : "year"}</span>
            </div>

            <button className="btn-primary" onClick={handlePayment}>
              Upgrade to Premium
            </button>
          </div>
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
          <button onClick={() => navigate("/privacy-policy")}>
            Privacy Policy
        </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
import { useState } from "react";
import "./Faq.css";
import { useEffect } from "react";
import axios from "axios";

function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");

  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (id) => {
      setOpenFaq(openFaq === id ? null : id);
  };

  useEffect(() => {
      const fetchFaqs = async () => {
          try {
              const res = await axios.get(
                  "http://localhost:5000/api/faqs"
              );
              setFaqs(res.data);
          } catch (error) {
              console.error(error);
          }
      };
      fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()) ||
      faq.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="faq-page">
      <div className="faq-hero">
          <h1>❓ Frequently Asked Questions</h1>
          <p>
              Find answers to the most common questions about FinWise,
              investments, expense tracking, and financial planning.
          </p>
          <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="faq-search"
          />
      </div>

      <div className="faq-container">
        {filteredFaqs.length === 0 ? (
            <div className="empty-faq">
                <h2>No FAQs Found</h2>
                <p>Try searching with a different keyword.</p>
            </div>
        ) : (
         filteredFaqs.map((faq, index) => (
          <div className="faq-card" key={faq._id}>
            <div
              className="faq-question"
              onClick={() => toggleFaq(faq._id)}
            >
              <h3>{faq.question}</h3>
              <span>{openFaq === faq._id ? "−" : "+"}</span>
            </div>

            {openFaq === faq._id && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        )))}
      </div>
    </div>
  );
}

export default Faq;
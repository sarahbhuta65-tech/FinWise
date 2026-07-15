import { useState } from "react";
import "./Faq.css";
import { useEffect } from "react";

function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const savedFaqs =
        JSON.parse(localStorage.getItem("faqs")) || [];

    const publishedFaqs = savedFaqs.filter(
        faq => faq.status === "Published"
    );

    setFaqs(publishedFaqs);
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
          <div className="faq-card" key={index}>
            <div
              className="faq-question"
              onClick={() => toggleFaq(index)}
            >
              <h3>{faq.question}</h3>
              <span>{openIndex === index ? "−" : "+"}</span>
            </div>

            {openIndex === index && (
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
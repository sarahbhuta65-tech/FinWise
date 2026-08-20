import { useState, useEffect } from "react";
import "./Faq.css";
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
                    `${import.meta.env.VITE_API_URL}/api/faqs`
                );

                setFaqs(res.data);
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
            }
        };

        fetchFaqs();
    }, []);

    const filteredFaqs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase()) ||
        faq.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="faq-page">

            {/* Hero */}
            <section className="faq-hero">

                <div className="faq-icon">
                    ?
                </div>

                <span className="faq-eyebrow">
                    FINWISE SUPPORT
                </span>

                <h1>
                    How can we <span>help?</span>
                </h1>

                <p>
                    Find answers to common questions about FinWise,
                    budgeting, investments, expenses, and financial planning.
                </p>

                {/* Search */}
                <div className="faq-search-wrapper">

                    <span className="faq-search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search questions, topics or keywords..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="faq-search"
                    />

                    {search && (
                        <button
                            className="faq-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}

                </div>

                {search && (
                    <div className="faq-result-count">
                        {filteredFaqs.length}{" "}
                        {filteredFaqs.length === 1 ? "result" : "results"} found
                    </div>
                )}

            </section>

            {/* FAQ List */}
            <section className="faq-container">

                {filteredFaqs.length === 0 ? (

                    <div className="empty-faq">

                        <div className="empty-faq-icon">
                            🔎
                        </div>

                        <h2>No FAQs Found</h2>

                        <p>
                            We couldn't find anything matching "{search}".
                            <br />
                            Try searching with a different keyword.
                        </p>

                        {search && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setSearch("")}
                            >
                                Clear Search
                            </button>
                        )}

                    </div>

                ) : (

                    filteredFaqs.map((faq) => {

                        const isOpen = openFaq === faq._id;

                        return (
                            <article
                                className={`faq-card ${isOpen ? "faq-card-open" : ""}`}
                                key={faq._id}
                            >

                                <button
                                    className="faq-question"
                                    onClick={() => toggleFaq(faq._id)}
                                    aria-expanded={isOpen}
                                >

                                    <div className="faq-question-left">

                                        <div className="faq-number">
                                            ?
                                        </div>

                                        <div className="faq-question-text">

                                            {faq.category && (
                                                <span className="faq-category">
                                                    {faq.category}
                                                </span>
                                            )}

                                            <h3>
                                                {faq.question}
                                            </h3>

                                        </div>

                                    </div>

                                    <span
                                        className={`faq-toggle ${
                                            isOpen ? "open" : ""
                                        }`}
                                    >
                                        +
                                    </span>

                                </button>

                                <div
                                    className={`faq-answer-wrapper ${
                                        isOpen ? "open" : ""
                                    }`}
                                >
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>

                            </article>
                        );
                    })

                )}

            </section>

            {/* Bottom Help Card */}
            <section className="faq-help-card">

                <div className="faq-help-icon">
                    💬
                </div>

                <div className="faq-help-content">

                    <h3>
                        Still have questions?
                    </h3>

                    <p>
                        Can't find what you're looking for?
                        Our FinWise AI Assistant can help you.
                    </p>

                </div>

                <button
                    className="faq-help-btn"
                    onClick={() => {
                        window.location.href = "/ai-assistant";
                    }}
                >
                    Ask FinWise AI →
                </button>

            </section>

        </div>
    );
}

export default Faq;
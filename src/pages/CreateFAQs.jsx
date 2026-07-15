import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Admin.css";

function CreateFAQs() {
    const [question, setQuestion] = useState("");
    const [category, setCategory] = useState("");
    const [answer, setAnswer] = useState("");
    const navigate = useNavigate();
    const {id} = useParams();

    const handleSave = (status) => {
        if (!question || !category || !answer){
            alert("Please fill all required fields");
            return;
        }
        const faqs = JSON.parse(localStorage.getItem("faqs")) || [];

        if (id) {
            const updatedfaqs = faqs.map((faq) =>
                faq.id == id
                ?{
                    ...faq,
                    question,
                    category,
                    answer,
                    status,
                }: faq
                );
            localStorage.setItem(
                "faqs",
                JSON.stringify(updatedfaqs)
            );
            alert("FAQ updated successfully");
        } else
        {
            const newFAQ = {
                id: Date.now(),
                question,
                category,
                answer,
                status,
                publishDate: new Date().toLocaleDateString(),
            };

            faqs.push(newFAQ);

            localStorage.setItem(
                "faqs",
                JSON.stringify(faqs)
            );

            alert("FAQ created successfully!");
        }

        navigate("/admin/faqs");
    };

    useEffect(() => {
        if (!id) return;

        const faqs = 
        JSON.parse(localStorage.getItem("faqs")) || [];

        const faq =faqs.find((item) => item.id == id);

        if (faq) {

            setQuestion(faq.question);
            setCategory(faq.category);
            setAnswer(faq.answer);
        }
    }, [id]);
    return(
        <div className="page-layout">
            <div className="page-header">
                <button className="back-btn"
                onClick={() => navigate("/admin/faqs")}>
                     ← Back to faqs
                </button>
                <h2>{id ? "Edit FAQ" : "Create New FAQ"}</h2>
            </div>

            <div className="form-page">
                <p>
                    {id 
                       ? "Update an existing FAQ."
                       : "Write and publish a new FAQ for the FinWise users."
                    }
                </p>

                <label>Question</label>
                <input
                type="text"
                placeholder="write the question here.."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                />

                <label>Category</label>
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    <option>SIP</option>
                    <option>EMI</option>
                    <option>Expense Tracking</option>
                    <option>Savings Goals</option>
                    <option>Financial Tips</option>
                    <option>Investment</option>
                    <option>Others</option>
                </select>

                <label>Answer</label>
                <textarea
                placeholder="write your answer here"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                />

                <div className="form-buttons">
                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/admin/faqs")}
                    >
                        Cancel
                    </button>

                    <button
                        className="draft-btn"
                        onClick={() => handleSave("Draft")}
                    >
                        Save Draft
                    </button>

                    <button
                        className="primary-btn"
                        onClick={() => handleSave("Published")}
                    >
                        Publish
                    </button>
                </div>
            </div>
        </div>
    );

}
export default CreateFAQs;
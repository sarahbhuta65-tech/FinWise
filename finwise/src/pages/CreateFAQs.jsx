import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Admin.css";
import axios from "axios";

function CreateFAQs() {
    const [question, setQuestion] = useState("");
    const [category, setCategory] = useState("");
    const [answer, setAnswer] = useState("");
    const navigate = useNavigate();
    const {id} = useParams();

    const handleSave = async (status) => {
        if (!question || !category || !answer) {
            alert("Please fill all required fields");
            return;
        }
        try {
            const faqData = {
                question,
                category,
                answer,
                status,
            };
            if (id) {
                await axios.put(
                    `http://${import.meta.env.VITE_API_URL}/api/faqs/${id}`,
                    faqData
                );
                alert("FAQ updated successfully!");
            } else {
                await axios.post(
                    "http://${import.meta.env.VITE_API_URL}/api/faqs",
                    faqData
                );
                alert("FAQ created successfully!");
            }
            navigate("/admin/faqs");
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        }
    };

    useEffect(() => {
        if (!id) return;
        const fetchFaq = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/faqs/${user._id}`
                );
                setQuestion(res.data.question);
                setCategory(res.data.category);
                setAnswer(res.data.answer);
            } catch (error) {
                console.error(error);
            }
        };
        fetchFaq();
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
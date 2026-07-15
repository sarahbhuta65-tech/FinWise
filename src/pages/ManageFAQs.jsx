import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Admin.css";

function ManageFAQs() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [faqs, setFaqs] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState(null);

    useEffect(() => {
        const savedFaqs = 
        JSON.parse(localStorage.getItem("faqs")) || [];

        setFaqs(savedFaqs);
    }, []);

    const handleDelete = () => {

        const updatedFaqs = faqs.filter(
            faq => faq.id !== selectedFaq.id
        );

        setFaqs(updatedFaqs);

        localStorage.setItem(
            "faqs",
            JSON.stringify(updatedFaqs)
        );

        setShowDeleteModal(false);

        setSelectedFaq(null);
    };

    const filteredFaqs = faqs.filter((faq) =>
    faq.question?.toLowerCase().includes(search.toLowerCase()) ||
    faq.category?.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer?.toLowerCase().includes(search.toLowerCase())
);


    return(

        <div className="page-layout">
            <div className="page-header">

                <div> 
                    <h1>Manage FAQs</h1>
                    <p>Manage all frequently asked questions for FinWise users.</p>
                </div>

                <button
                    className="primary-btn"
                    onClick={() => navigate("/admin/faqs/create")}
                >
                    + New FAQ
                </button>
            </div>

            <div className="search-bar">
                <input 
                   type="text"
                   placeholder="Search FAQs..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}/>
                   {search && (
                    <button className="secondary-btn"
                     onClick={() => setSearch("")}>Clear</button>
                )}
            </div>
            {filteredFaqs.length == 0 ? (
            <div className="empty-state">
                <h2>No FAQs available yet.</h2>
                <p>Create your first FAQ to help users.</p>

                <button
                    className="primary-btn"
                    onClick={() => navigate("/admin/faqs/create")}
                >
                    + Create FAQ
                </button>
            </div>
            ) : (
                <div className="faqs-container">
                    {filteredFaqs.map((faq) => (
                        <div className="blog-card" key={faq.id}>

                            <div className="blog-top">

                                <div>
                                    <h2 className="blog-question">
                                        {faq.question}
                                    </h2>

                                    <span className="category-badge">
                                        {faq.category}
                                    </span>

                                </div>

                            </div>

                            <p className="blog-answer">
                                {faq.answer}
                            </p>

                            <div className="blog-footer">

                                <div className="blog-meta">
                                    <span>📅 {faq.publishDate}</span>
                                </div>

                                <span
                                        className={
                                            faq.status === "Published"
                                                ? "status published"
                                                : "status draft"
                                        }
                                    >
                                        {faq.status}
                                    </span>

                                <div className="blog-actions">

                                    <button
                                        className="edit-btn"
                                        onClick={() => navigate(`/admin/faqs/edit/${faq.id}`)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={()=>{
                                            setSelectedBlog(blog);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
        )}
        {
        showDeleteModal && (

        <div className="modal-overlay">

            <div className="delete-modal">

                <h2>Delete Faq?</h2>

                <p>
                    Are you sure you want to delete
                    <strong> "{selectedFaq?.title}" </strong> ?
                </p>

                <div className="modal-buttons">

                    <button
                        className="secondary-btn"
                        onClick={()=>{
                            setShowDeleteModal(false);
                            setSelectedFaq(null);
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        className="delete-confirm-btn"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>

        )}
        </div>
    );
}

export default ManageFAQs;
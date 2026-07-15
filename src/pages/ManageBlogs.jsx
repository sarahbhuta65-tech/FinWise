import { useNavigate } from "react-router-dom";
import { useEffect, useState} from "react";
import "./Admin.css";

function ManageBlogs() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const savedBlogs = 
        JSON.parse(localStorage.getItem("blogs")) || [];

        setBlogs(savedBlogs);
    }, []);

    const handleDelete = () => {

        const updatedBlogs = blogs.filter(
            blog => blog.id !== selectedBlog.id
        );

        setBlogs(updatedBlogs);

        localStorage.setItem(
            "blogs",
            JSON.stringify(updatedBlogs)
        );

        setShowDeleteModal(false);

        setSelectedBlog(null);
    };

    const filteredBlogs = blogs.filter((blog) => 
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.category.toLowerCase().includes(search.toLowerCase()) ||
        blog.description.toLowerCase().includes(search.toLowerCase()));


    return(
        <div className="manage-page">
            <div className="page-header">
                <div>
                    <h1>Manage Blogs</h1>
                    <p> Manage all published and draft blogs.</p>
                </div>

                <button className="primary-btn"
                        onClick={() => navigate("/admin/blogs/create")}>
                            + New Blog
                </button>
            </div>

            <div className="search-bar">
                <input 
                type="text" 
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}/>
                {search && (
                    <button className="secondary-btn"
                     onClick={() => setSearch("")}>Clear</button>
                )}
            </div>

            {filteredBlogs.length == 0 ? (
                <div className="empty-state">
                    <h2>No blogs available yet.</h2>

                    <p>
                        start by creating your first blog.
                    </p>

                    <button className="primary-btn"
                            onClick={() => navigate("/admin/blogs/create")}>
                        + Create Blog
                    </button>
                </div>
            ) : (
                <div className="blogs-container">
                    {filteredBlogs.map((blog) => (
                        <div className="blog-card" key={blog.id}>

                            <div className="blog-top">

                                <div>
                                    <h2 className="blog-title">
                                        {blog.title}
                                    </h2>
                                    <span className="category-badge">
                                        {blog.category}
                                    </span>
                                </div>

                            </div>

                            <p className="blog-description">
                                {blog.description}
                            </p>

                            <div className="blog-footer">

                                <div className="blog-meta">
                                    <span>
                                        📅 {blog.publishDate}
                                    </span>

                                    <span>
                                        ✍ {blog.author}
                                    </span>

                                    <span
                                        className={
                                            blog.status === "Published"
                                                ? "status published"
                                                : "status draft"
                                        }
                                    >
                                        {blog.status}
                                    </span>
                                </div>

                                <div className="blog-actions">
                                    <button className="edit-btn"
                                            onClick={() => navigate(`/admin/blogs/edit/${blog.id}`)}>
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

                    <h2>Delete Blog?</h2>

                    <p>
                        Are you sure you want to delete
                        <strong> "{selectedBlog?.title}" </strong> ?
                    </p>

                    <div className="modal-buttons">

                        <button
                            className="secondary-btn"
                            onClick={()=>{
                                setShowDeleteModal(false);
                                setSelectedBlog(null);
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

export default ManageBlogs;
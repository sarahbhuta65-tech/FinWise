import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Blogs.css";
import axios from "axios";

function Blogs() {
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/blogs`
                );

                setBlogs(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter((blog) => {
        const query = search.toLowerCase();

        return (
            blog.title?.toLowerCase().includes(query) ||
            blog.description?.toLowerCase().includes(query) ||
            blog.category?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="blogs-page">

            {/* HERO */}
            <section className="blogs-hero">

                <div className="blogs-eyebrow">
                    FINANCIAL KNOWLEDGE
                </div>

                <h1>
                    Learn. Plan. <span>Grow.</span>
                </h1>

                <p>
                    Practical insights to help you save smarter,
                    invest better and build stronger financial habits.
                </p>

                <div className="blogs-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search financial articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

            </section>


            {/* BLOG SECTION */}
            <section className="blogs-section">

                <div className="blogs-section-header">

                    <div>
                        <span className="section-eyebrow">
                            FINWISE INSIGHTS
                        </span>

                        <h2>
                            Latest financial insights
                        </h2>
                    </div>

                    <span className="blog-count">
                        {filteredBlogs.length} articles
                    </span>

                </div>


                {filteredBlogs.length === 0 ? (

                    <div className="blog-empty-state">

                        <div className="empty-icon">
                            🔎
                        </div>

                        <h2>No articles found</h2>

                        <p>
                            Try searching with a different keyword.
                        </p>

                        {search && (
                            <button
                                onClick={() => setSearch("")}
                            >
                                Clear search
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="blogs-grid">

                        {filteredBlogs.map((blog) => {

                            const blogId = blog._id || blog.id;

                            return (

                                <article
                                    className="blog-card"
                                    key={blogId}
                                    onClick={() => {

                                        if (!blogId) {
                                            console.error(
                                                "Blog missing ID:",
                                                blog
                                            );
                                            return;
                                        }

                                        navigate(`/blog/${blogId}`);
                                    }}
                                >

                                    {/* IMAGE */}

                                    <div className="blog-image-wrapper">

                                        {blog.thumbnail ? (

                                            <img
                                                src={blog.thumbnail}
                                                alt={blog.title}
                                                className="blog-image"
                                            />

                                        ) : (

                                            <div className="blog-image-placeholder">
                                                FinWise
                                            </div>

                                        )}

                                        <span className="blog-category">
                                            {blog.category}
                                        </span>

                                    </div>


                                    {/* CONTENT */}

                                    <div className="blog-card-content">

                                        <h3>
                                            {blog.title}
                                        </h3>

                                        <p>
                                            {blog.description?.length > 130
                                                ? blog.description.substring(
                                                    0,
                                                    130
                                                ) + "..."
                                                : blog.description}
                                        </p>


                                        <div className="blog-card-footer">

                                            <div className="blog-meta">

                                                <span>
                                                    👤 {blog.author}
                                                </span>

                                                <span>
                                                    📅 {blog.publishDate}
                                                </span>

                                            </div>

                                            <span className="read-more">
                                                Read article →
                                            </span>

                                        </div>

                                    </div>

                                </article>

                            );

                        })}

                    </div>

                )}

            </section>

        </div>
    );
}

export default Blogs;
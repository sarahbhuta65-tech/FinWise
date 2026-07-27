import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import "./Admin.css";
import axios from "axios";

function CreateBlog() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [content, setContent] = useState("");
    const author = "Sarah";
    const navigate = useNavigate();
    const { id } = useParams();

    const handleSave = async (status) => {

        if (!title || !category || !description || !content) {
            alert("Please fill all required fields.");
            return;
        }
        try {
            if (id) {

                await axios.put(
                    `http://${import.meta.env.VITE_API_URL}/api/blogs/${id}`,
                    {
                        title,
                        category,
                        description,
                        thumbnail,
                        content,
                        author,
                        status,
                        publishDate: new Date().toLocaleDateString(),
                    }
                );

                alert("Blog updated successfully");

            } else {

               await axios.post(
                    "http://${import.meta.env.VITE_API_URL}/api/blogs",
                    {
                        title,
                        category,
                        description,
                        thumbnail,
                        content,
                        author,
                        status,
                        publishDate: new Date().toLocaleDateString(),
                    }
                );

                alert("Blog created successfully");
            }

            navigate("/admin/blogs");

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    useEffect(() => {
        if (!id) return;
        const fetchBlog = async () => {
            try {

                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/blogs/${user._id}`
                );

                const blog = res.data;

                setTitle(blog.title);
                setCategory(blog.category);
                setDescription(blog.description);
                setThumbnail(blog.thumbnail);
                setContent(blog.content);

            } catch (error) {
                console.error(error);
            }
        };

        fetchBlog();

    }, [id]);

    return(
        <div className="page-layout">
           <div className="page-header">
                <button className="back-btn"
                        onClick={() => navigate("/admin/blogs")}>
                    ← Back to blogs
                </button>
                <h2>Create New BLog</h2>
           </div>
            <div className="form-page">
                <p>Write and publish a new blog for FinWise users.</p>

                <label>Title</label>
                <input 
                type="text"
                placeholder="Enter the title of your blog"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />

                <label>category</label>
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

                <label>Short Description</label>
                <input 
                type="text"
                placeholder="Write the short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />

                <label>Thumbnail URL</label>
                <input 
                type="text"
                placeholder="URL"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                />

                <label>Content</label>
                <RichTextEditor
                    content={content}
                    setContent={setContent}
                />

                <label>Author</label>
                <input 
                value={author}
                readOnly
                />

                <div className="form-buttons">
                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/admin/blogs")}
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

export default CreateBlog; 
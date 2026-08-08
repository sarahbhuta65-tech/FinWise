import { useState } from "react";
import "./AddCommitmentModal.css";

function AddCommitmentModal({ closeModal, onSave }) {

    const [formData, setFormData] = useState({
        type: "EMI",
        title: "",
        amount: "",
        dueDate: "",
        notes: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {

        if (!formData.title || !formData.amount || !formData.dueDate) {
            alert("Please fill all required fields.");
            return;
        }

        onSave(formData);
    };

    return (

        <div className="modal-overlay">

            <div className="modal-box">

                <h2>Add Commitment</h2>

                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="Income">Income</option>
                    <option value="EMI">EMI</option>
                    <option value="SIP">SIP</option>
                    <option value="Bill">Bill</option>
                    <option value="Savings">Savings</option>
                </select>

                <input
                    type="text"
                    name="title"
                    placeholder="Commitment Name"
                    value={formData.title}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                />

                <textarea
                    name="notes"
                    placeholder="Notes (optional)"
                    value={formData.notes}
                    onChange={handleChange}
                />

                <div className="modal-buttons">

                    <button
                        className="cancel-btn"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>

                    <button
                        className="save-btn"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>

    );
}

export default AddCommitmentModal;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { createLog } from "../../services/logService";

export default function CreateLog() {
  const [form, setForm] = useState({ title: "", week_number: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createLog(form);
      navigate("/student/logs");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Submit Weekly Log">
      <div style={{ maxWidth: 620, background: "#fff", padding: "2rem", borderRadius: 10 }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Log Title</label>
          <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Week Number</label>
          <input name="week_number" type="number" min={1} value={form.week_number} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Log Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} required rows={8} style={{ ...inputStyle, resize: "vertical" }} />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Submitting..." : "Submit Log"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

const labelStyle = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" };
const inputStyle = { display: "block", width: "100%", padding: "0.6rem", marginBottom: "1rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" };
const btnStyle = { padding: "0.7rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 };
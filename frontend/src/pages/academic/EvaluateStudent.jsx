import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchStudentById, submitEvaluation } from "../../services/evaluationService";

const CRITERIA = [
  { key: "technical", label: "Technical Skills", max: 40 },
  { key: "communication", label: "Communication", max: 30 },
  { key: "professionalism", label: "Professionalism", max: 30 },
];

export default function EvaluateStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [scores, setScores] = useState({ technical: "", communication: "", professionalism: "" });
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStudentById(id)
      .then(setStudent)
      .catch(() => setError("Could not load student."))
      .finally(() => setLoading(false));
  }, [id]);

  const total = CRITERIA.reduce((sum, c) => sum + (Number(scores[c.key]) || 0), 0);
  const maxTotal = CRITERIA.reduce((sum, c) => sum + c.max, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitEvaluation({ student: id, ...scores, comment });
      setSuccess(true);
      setTimeout(() => navigate("/academic/students"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout title="Evaluate Student"><p>Loading...</p></Layout>;
  if (error && !student) return <Layout title="Evaluate Student"><p style={{ color: "red" }}>{error}</p></Layout>;

  return (
    <Layout title={`Evaluate: ${student?.name}`}>
      <div style={{ maxWidth: 640, background: "#fff", padding: "2rem", borderRadius: 10 }}>
        <p style={{ color: "#64748b" }}>Company: <strong>{student?.company}</strong> | Logs submitted: <strong>{student?.log_count}</strong></p>
        <hr />

        {success && <p style={{ color: "#16a34a", fontWeight: 600 }}>✅ Evaluation submitted! Redirecting...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {CRITERIA.map(c => (
            <div key={c.key} style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                {c.label} <span style={{ color: "#64748b", fontWeight: 400 }}>(max {c.max})</span>
              </label>
              <input
                type="number" min={0} max={c.max}
                value={scores[c.key]}
                onChange={e => setScores({ ...scores, [c.key]: e.target.value })}
                required
                style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>
          ))}

          <div style={{ background: "#f1f5f9", padding: "1rem", borderRadius: 8, marginBottom: "1.25rem", textAlign: "center" }}>
            <strong>Total Score: </strong>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: total >= 70 ? "#16a34a" : "#dc2626" }}>
              {total} / {maxTotal}
            </span>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Comments</label>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              rows={4} style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <button type="submit" disabled={submitting} style={{ padding: "0.75rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
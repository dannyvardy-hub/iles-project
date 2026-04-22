import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchStudents } from "../../services/evaluationService";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents().then(setStudents).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Students to Evaluate">
      {loading && <p>Loading students...</p>}
      {!loading && students.length === 0 && <p>No students assigned to you.</p>}
      {students.map(s => (
        <div key={s.id} style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div>
            <strong>{s.name}</strong>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>Company: {s.company} | Logs: {s.log_count}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: s.evaluated ? "#16a34a" : "#d97706", fontWeight: 600 }}>
              {s.evaluated ? "✅ Evaluated" : "⏳ Pending"}
            </span>
            <button
              onClick={() => navigate(`/academic/evaluate/${s.id}`)}
              style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
              {s.evaluated ? "View Score" : "Evaluate"}
            </button>
          </div>
        </div>
      ))}
    </Layout>
  );
}
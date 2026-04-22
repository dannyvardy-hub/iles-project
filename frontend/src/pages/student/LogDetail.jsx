import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchLogById } from "../../services/logService";

export default function LogDetail() {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogById(id)
      .then(setLog)
      .catch(() => setError("Could not load this log."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout title="Log Detail"><p>Loading...</p></Layout>;
  if (error) return <Layout title="Log Detail"><p style={{ color: "red" }}>{error}</p></Layout>;

  return (
    <Layout title={`Log: ${log.title}`}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem", background: "none", border: "1px solid #cbd5e1", padding: "0.4rem 0.9rem", borderRadius: 6, cursor: "pointer" }}>← Back</button>
      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: 0 }}><strong>Week {log.week_number}</strong></p>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>Submitted: {log.submitted_at?.slice(0, 10)}</p>
          </div>
          <span style={{ color: statusColor(log.status), fontWeight: 700, textTransform: "uppercase" }}>{log.status}</span>
        </div>
        <hr />
        <p style={{ lineHeight: 1.7 }}>{log.content}</p>

        {log.feedback && (
          <div style={{ marginTop: "1.5rem", background: "#fef3c7", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #f59e0b" }}>
            <strong>Supervisor Feedback:</strong>
            <p style={{ margin: "0.5rem 0 0" }}>{log.feedback}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

const statusColor = s => ({ approved: "#16a34a", pending: "#d97706", returned: "#dc2626" }[s] || "#64748b");
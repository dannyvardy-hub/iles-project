import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchPendingLogs } from "../../services/logService";

export default function SupervisorDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingLogs().then(setPending).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Supervisor Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
        <div style={card("#2563eb")}>
          <p style={{ margin: 0, color: "#93c5fd" }}>Pending Reviews</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#fff" }}>{loading ? "..." : pending.length}</h2>
        </div>
        <div style={card("#16a34a")}>
          <p style={{ margin: 0, color: "#bbf7d0" }}>Action Required</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#fff" }}>{loading ? "..." : pending.length}</h2>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Logs Awaiting Review</h3>
        {loading && <p>Loading...</p>}
        {!loading && pending.length === 0 && <p style={{ color: "#64748b" }}>No logs pending review. ✅</p>}
        {pending.map(log => (
          <div key={log.id}
            onClick={() => navigate(`/supervisor/review/${log.id}`)}
            style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
            <span><strong>{log.student_name}</strong> — Week {log.week_number}: {log.title}</span>
            <span style={{ color: "#d97706" }}>pending</span>
          </div>
        ))}
        <button onClick={() => navigate("/supervisor/review")} style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          View All Logs
        </button>
      </div>
    </Layout>
  );
}

const card = {
  padding: "15px",
  background: "#fff",
  borderRadius: "10px",
};

export default function Dashboard() {

import Layout from "../../components/Layout";

export default function SupervisorDashboard() {
  return (
    <Layout title="Supervisor Dashboard">

      <div style={{ display: "grid", gap: "15px" }}>

        <div style={card}>
          <h3>👨‍🎓 Assigned Interns</h3>
          <button>View Interns</button>
        </div>

        <div style={card}>
          <h3>📄 Pending Logs</h3>
          <button>Review Logs</button>
        </div>

      </div>

    </Layout>
  );
}

const card = {
  padding: "15px",
  background: "#fff",
  borderRadius: "10px",
};

const card = (bg) => ({ background: bg, padding: "1.25rem", borderRadius: 10 });

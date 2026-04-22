

import Layout from "../../components/Layout";

export default function StudentDashboard() {
  return (
    <Layout title="Student Dashboard">

      <div style={{ display: "grid", gap: "15px" }}>

        {/* CARDS */}
        <div style={card}>
          <h3>📍 Placement</h3>
          <p>Company: Tech Ltd</p>
          <p>Supervisor: Mr John</p>
        </div>

        <div style={card}>
          <h3>📝 Weekly Logs</h3>
          <button>Create Log</button>
          <button>View Logs</button>
        </div>

        <div style={card}>
          <h3>📊 Status</h3>
          <p>2 Submitted | 1 Draft</p>
        </div>

      </div>

    </Layout>
  );
}

const card = {
  padding: "15px",
  background: "white",
  borderRadius: "10px",
  boxShadow: "0 0 5px rgba(0,0,0,0.1)"
};

export default function Dashboard() {

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/Layout";
import { fetchLogs } from "../../services/logService";

export default function StudentDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs().then(setLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total = logs.length;
  const approved = logs.filter(l => l.status === "approved").length;
  const pending = logs.filter(l => l.status === "pending").length;
  const returned = logs.filter(l => l.status === "returned").length;

  return (
    <Layout title="Student Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
        {[
          { label: "Total Logs", value: total, color: "#2563eb" },
          { label: "Approved", value: approved, color: "#16a34a" },
          { label: "Pending", value: pending, color: "#d97706" },
          { label: "Returned", value: returned, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: `4px solid ${s.color}` }}>
            <p style={{ color: "#64748b", margin: 0 }}>{s.label}</p>
            <h2 style={{ margin: "0.25rem 0 0", color: s.color }}>{loading ? "..." : s.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Recent Logs</h3>
        {loading ? <p>Loading...</p> : logs.slice(0, 5).map(log => (
          <div
            key={log.id}
            onClick={() => navigate(`/student/logs/${log.id}`)}
            style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", justifyContent: "space-between" }}
          >
            <span><strong>Week {log.week_number}</strong> — {log.title}</span>
            <span style={{ color: statusColor(log.status) }}>{log.status}</span>
          </div>
        ))}
        <button onClick={() => navigate("/student/logs/create")} style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          + Submit New Log
        </button>
      </div>
    </Layout>
  );
}

const statusColor = s => ({ approved: "#16a34a", pending: "#d97706", returned: "#dc2626" }[s] || "#64748b");
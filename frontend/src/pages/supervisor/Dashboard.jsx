import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchDashboard } from "../../services/userService";

export default function SupervisorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Supervisor Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
        {[
          { label: "Total Interns", value: data?.total_interns, color: "#2563eb" },
          { label: "Pending Reviews", value: data?.pending_reviews, color: "#d97706" },
          { label: "Approved Logs", value: data?.approved_logs, color: "#16a34a" },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: 4px solid ${c.color} }}>
            <p style={{ margin: 0, color: "#64748b" }}>{c.label}</p>
            <h2 style={{ margin: "0.25rem 0 0", color: c.color }}>{loading ? "..." : c.value}</h2>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1.5rem", background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <button
          onClick={() => navigate("/supervisor/logs")}
          style={{ padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Review Pending Logs
        </button>
      </div>
    </Layout>
  );
}
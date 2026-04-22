import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/Layout";
import { fetchAdminStats } from "../../services/userService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, supervisors: 0, academics: 0, logs: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Students", value: stats.students, color: "#2563eb" },
    { label: "Supervisors", value: stats.supervisors, color: "#7c3aed" },
    { label: "Academic Supervisors", value: stats.academics, color: "#0891b2" },
    { label: "Total Logs", value: stats.logs, color: "#16a34a" },
  ];

  return (
    <Layout title="Admin Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: `4px solid ${c.color}` }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>{c.label}</p>
            <h2 style={{ margin: "0.25rem 0 0", color: c.color }}>{loading ? "..." : c.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <button onClick={() => navigate("/admin/users")} style={{ padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Manage Users
        </button>
      </div>
    </Layout>
  );
}

const card = {
  padding: "15px",
  background: "white",
  borderRadius: "10px",
};

export default function Dashboard() {

import Layout from "../../components/Layout";

export default function AdminDashboard() {
  return (
    <Layout title="Admin Dashboard">

      <div style={{ display: "grid", gap: "15px" }}>

        <div style={card}>
          <h3>👥 Users</h3>
          <button>Manage Users</button>
        </div>

        <div style={card}>
          <h3>📍 Placements</h3>
          <button>Assign Placement</button>
        </div>

        <div style={card}>
          <h3>📊 Reports</h3>
          <button>View Reports</button>
        </div>

      </div>

    </Layout>
  );
}

const card = {
  padding: "15px",
  background: "white",
  borderRadius: "10px",
};
}

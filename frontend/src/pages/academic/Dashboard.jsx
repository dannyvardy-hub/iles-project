
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchStats } from "../../services/evaluationService";

export default function AcademicDashboard() {
  const [stats, setStats] = useState({ pending: 0, evaluated: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Academic Supervisor Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: "4px solid #f59e0b" }}>
          <p style={{ margin: 0, color: "#64748b" }}>Pending Evaluations</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#f59e0b" }}>{loading ? "..." : stats.pending}</h2>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: "4px solid #16a34a" }}>
          <p style={{ margin: 0, color: "#64748b" }}>Completed</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#16a34a" }}>{loading ? "..." : stats.evaluated}</h2>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", background: "#fff", padding: "1.5rem", borderRadius: 10, display: "grid", gap: 12 }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <button onClick={() => navigate("/academic/students")} style={btnStyle("#2563eb")}>
          🎯 View Students to Evaluate
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

export default function AcademicDashboard() {
  return (
    <Layout title="Academic Supervisor">

      <div style={{ display: "grid", gap: "15px" }}>

        <div style={card}>
          <h3>🎯 Students to Evaluate</h3>
          <button>View Students</button>
        </div>

        <div style={card}>
          <h3>📊 Scoring</h3>
          <button>Open Evaluation Form</button>
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

const btnStyle = (bg) => ({ padding: "0.75rem", background: bg, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "1rem" });


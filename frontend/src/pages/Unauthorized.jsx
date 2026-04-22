import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>⛔ Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
}
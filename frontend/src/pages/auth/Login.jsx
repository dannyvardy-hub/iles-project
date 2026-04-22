import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const navigate = useNavigate();
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("student");

  const navigate = useNavigate();


  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    // TEMP FAKE LOGIN (NO BACKEND YET)
    localStorage.setItem(
      "user",
      JSON.stringify({ email, role })
    );

    // redirect based on role
    if (role === "student") navigate("/student");
    else if (role === "supervisor") navigate("/supervisor");
    else if (role === "academic") navigate("/academic");
    else if (role === "admin") navigate("/admin");
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2>ILES Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* ROLE SELECTOR */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        >
          <option value="student">Student Intern</option>
          <option value="supervisor">Workplace Supervisor</option>
          <option value="academic">Academic Supervisor</option>
          <option value="admin">Administrator</option>
        </select>

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    width: "350px",
    padding: "25px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#2d6cdf",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
    const user = login(email, password);
    // TEMP FAKE LOGIN (NO BACKEND YET)
    localStorage.setItem(
      "user",
      JSON.stringify({ email, role })
    );

    // redirect based on role
    if (role === "student") navigate("/student");
    else if (role === "supervisor") navigate("/supervisor");
    else if (role === "academic") navigate("/academic");
    else if (role === "admin") navigate("/admin");
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2>ILES Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* ROLE SELECTOR */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        >
          <option value="student">Student Intern</option>
          <option value="supervisor">Workplace Supervisor</option>
          <option value="academic">Academic Supervisor</option>
          <option value="admin">Administrator</option>
        </select>

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    width: "350px",
    padding: "25px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#2d6cdf",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

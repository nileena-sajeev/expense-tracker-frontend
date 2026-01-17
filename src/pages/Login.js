import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/auth/login`, form);

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finora-bg">
      <div className="top-right">♡</div>

      <div className="finora-card">
        <div className="cloud-icon">☁️</div>

        <h1 className="finora-title">Finora</h1>
        <p className="finora-subtitle">manage your money gently</p>

        <form onSubmit={handleSubmit}>
          <input
            className="finora-input"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            className="finora-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button className="login-btn" disabled={loading} type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button className="create-btn" onClick={() => navigate("/register")}>
          Create Account
        </button>

        <p className="quick">simple • safe • sweet</p>
      </div>
    </div>
  );
}

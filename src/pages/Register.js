import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // ✅ reuse same Finora styles
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Account created successfully!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="finora-bg">
      <div className="finora-card">
        <div className="cloud-icon">☁️</div>

        <h1 className="finora-title">Create Account</h1>
        <p className="finora-subtitle">start managing your money</p>


        <form onSubmit={handleSubmit}>
          <input
            className="finora-input"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

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

          <button className="login-btn">Register</button>
        </form>

        <button
          className="create-btn"
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>

        <p className="quick">simple • safe • sweet</p>
      </div>
    </div>
  );
}

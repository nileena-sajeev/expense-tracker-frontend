import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Dashboard.css";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const api = axios.create({
      baseURL: "http://localhost:5000/api",
      headers: { Authorization: `Bearer ${token}` }
    });

    api.get("/auth/profile").then((res) => {
      setUser(res.data);
    });
  }, [token, navigate]);

  if (!user) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <motion.div
      className="finora-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="finora-card" style={{ maxWidth: "420px" }}>
        <h2>Profile</h2>

        <div className="profile-row">
          <b>Name:</b> {user.name}
        </div>

        <div className="profile-row">
          <b>Email:</b> {user.email}
        </div>

        <div className="profile-row">
          <b>Monthly Limit:</b> ₹{user.monthly_limit || 0}
        </div>

        <button
          className="primary"
          style={{ marginTop: "20px" }}
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
}

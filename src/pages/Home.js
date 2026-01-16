import { useNavigate } from "react-router-dom";
import "./Home.css";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="finora-bg">
      <div className="finora-home-card">

        <div className="home-icons">
          <span className="menu-icon">☰</span>
          <span className="heart-icon">♡</span>
        </div>

        <div className="home-logo">
          <div className="cloud">☁️</div>
        </div>

        <h1 className="home-title">Finora</h1>
        <p className="home-subtitle">expense tracker</p>

        

        <button className="home-btn primary-btn" onClick={() => navigate("/login")}>
          Login
        </button>

        <button className="home-btn secondary-btn" onClick={() => navigate("/register")}>
          Create Account
        </button>

        <p className="home-footer">simple • safe • sweet</p>
      </div>
    </div>
  );
}

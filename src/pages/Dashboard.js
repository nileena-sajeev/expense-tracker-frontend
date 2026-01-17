import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FiLogOut } from "react-icons/fi";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ HARDCODE backend URL (NO localhost fallback)
const API_URL = "https://expense-tracker-backend-gvq2.onrender.com";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, limit: 0 });
  const [newLimit, setNewLimit] = useState("");
  const [chartData, setChartData] = useState([]);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_URL + "/api",
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [token]);

  const buildChartData = useCallback((allExpenses) => {
    const map = {};
    allExpenses.forEach((e) => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });

    setChartData(
      Object.keys(map).map((key) => ({
        category: key,
        total: map[key],
      }))
    );
  }, []);

  const refreshSummary = useCallback(async () => {
    const sum = await api.get("/expenses/summary");
    setSummary({
      total: Number(sum.data.total),
      limit: Number(sum.data.limit),
    });
  }, [api]);

  useEffect(() => {
    const loadData = async () => {
      const exp = await api.get("/expenses");
      setExpenses(exp.data);
      buildChartData(exp.data);
      await refreshSummary();
    };
    loadData();
  }, [api, refreshSummary, buildChartData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/expenses", form);
    const updated = [res.data, ...expenses];
    setExpenses(updated);
    buildChartData(updated);
    setForm({ title: "", amount: "", category: "Food" });
    await refreshSummary();
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    buildChartData(updated);
    await refreshSummary();
  };

  const updateLimit = async (e) => {
    e.preventDefault();
    await api.post("/auth/limit", { limit: newLimit });
    setNewLimit("");
    await refreshSummary();
  };

  return (
    <div className="finora-bg">
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        <FiLogOut />
      </button>
    </div>
  );
}

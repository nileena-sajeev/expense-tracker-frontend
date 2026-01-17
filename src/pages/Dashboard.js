import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FiLogOut } from "react-icons/fi";

// ✅ Chart.js setup
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ Netlify ENV support
const API_URL = process.env.REACT_APP_API_URL || "https://finoraaa.netlify.app/";

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

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // ✅ Axios instance
  const api = useMemo(() => {
    return axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [token]);

  // ✅ Build chart breakdown
  const buildChartData = useCallback((allExpenses) => {
    if (!Array.isArray(allExpenses)) {
      setChartData([]);
      return;
    }

    const map = {};

    allExpenses.forEach((e) => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });

    const final = Object.keys(map).map((key) => ({
      category: key,
      total: map[key],
    }));

    setChartData(final);
  }, []);

  // ✅ Refresh summary
  const refreshSummary = useCallback(async () => {
    try {
      const sum = await api.get(`/expenses/summary?_=${Date.now()}`);

      setSummary({
        total: Number(sum.data.total || 0),
        limit: Number(sum.data.limit || 0),
      });
    } catch (err) {
      console.log("❌ Summary error:", err.response?.data || err.message);
    }
  }, [api]);

  // ✅ Load expenses + summary
  useEffect(() => {
    const loadData = async () => {
      try {
        const expRes = await api.get("/expenses");

        // ✅ SAFETY: backend might send array OR { expenses: [] }
        const expData = Array.isArray(expRes.data)
          ? expRes.data
          : expRes.data.expenses || [];

        setExpenses(expData);
        buildChartData(expData);

        await refreshSummary();
      } catch (err) {
        console.log("❌ Load error:", err.response?.data || err.message);
      }
    };

    loadData();
  }, [api, refreshSummary, buildChartData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ ADD EXPENSE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form.title || !form.amount) {
        alert("Please enter title & amount");
        return;
      }

      const res = await api.post("/expenses", {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
      });

      setExpenses((prev) => {
        const updated = [res.data, ...(Array.isArray(prev) ? prev : [])];
        buildChartData(updated);
        return updated;
      });

      setForm({ title: "", amount: "", category: "Food" });

      await refreshSummary();
    } catch (err) {
      console.log("❌ Add expense error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Add expense failed");
    }
  };

  // ✅ DELETE EXPENSE
  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);

      setExpenses((prev) => {
        const updated = (Array.isArray(prev) ? prev : []).filter(
          (x) => (x._id || x.id) !== id
        );
        buildChartData(updated);
        return updated;
      });

      await refreshSummary();
    } catch (err) {
      console.log("❌ Delete error:", err.response?.data || err.message);
      alert("Delete failed");
    }
  };

  // ✅ UPDATE LIMIT
  const updateLimit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/limit", { limit: newLimit });
      setNewLimit("");
      await refreshSummary();
    } catch (err) {
      console.log("❌ Limit update error:", err.response?.data || err.message);
      alert("Limit update failed");
    }
  };

  // ✅ Pie chart colors
  const pastelColors = ["#f7b2bd", "#fcd5a5", "#b8e0d2", "#cdb4db", "#a2d2ff"];

  const pieData = {
    labels: chartData.map((x) => x.category),
    datasets: [
      {
        label: "Expenses",
        data: chartData.map((x) => x.total),
        backgroundColor: chartData.map(
          (_, i) => pastelColors[i % pastelColors.length]
        ),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  return (
    <div className="finora-bg fade-page">
      <div className="dashboard-shell">
        {/* ✅ LEFT PANEL */}
        <div className="dashboard-left">
          <div className="finora-card">
            <div className="dash-top">
              <h2>Dashboard</h2>

              <button
                className="logout-float"
                title="Logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                <FiLogOut size={18} />
              </button>
            </div>

            <h3>Monthly Limit</h3>

            <form onSubmit={updateLimit}>
              <input
                placeholder="Enter your monthly limit"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
              />

              <button className="primary" type="submit">
                Save Limit
              </button>
            </form>

            <div className="summary-box">
              <p>
                <b>Total spent this month:</b> ₹{summary.total}
              </p>
              <p>
                <b>Your limit:</b> ₹{summary.limit}
              </p>
            </div>

            {/* ✅ Progress Bar */}
            {summary.limit > 0 && (
              <div className="progress-wrapper">
                <div className="progress-labels">
                  <span>0</span>
                  <span>₹{summary.limit}</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (summary.total / summary.limit) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="progress-text">
                  {Math.min((summary.total / summary.limit) * 100, 100).toFixed(
                    0
                  )}
                  % used
                </p>
              </div>
            )}

            {summary.limit > 0 && summary.total > summary.limit && (
              <p className="limit-warning">
                🤯 Oops! You crossed your spending limit. <br />
                Do you regret this expense?
              </p>
            )}

            {/* ✅ CHART */}
            <div className="chart-box">
              <h3 style={{ marginTop: "20px" }}>This Month Breakdown</h3>

              {chartData.length === 0 ? (
                <p className="empty-text">No chart data yet</p>
              ) : (
                <Pie data={pieData} options={pieOptions} />
              )}
            </div>
          </div>
        </div>

        {/* ✅ RIGHT PANEL */}
        <div className="dashboard-right">
          <div className="finora-card">
            <h3>Add Expense</h3>

            <form onSubmit={handleSubmit}>
              <input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                required
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Other</option>
              </select>

              <button className="primary" type="submit">
                Add Expense
              </button>
            </form>

            <h3 style={{ marginTop: "18px" }}>Your Expenses</h3>

            <div className="expense-list">
              {expenses.length === 0 ? (
                <p className="empty-text">No expenses yet</p>
              ) : (
                expenses.map((e) => (
                  <div className="expense" key={e._id || e.id}>
                    <span className="expense-text">
                      {e.title} — ₹{e.amount} — {e.category}
                    </span>

                    <button
                      className="secondary small-btn"
                      onClick={() => deleteExpense(e._id || e.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

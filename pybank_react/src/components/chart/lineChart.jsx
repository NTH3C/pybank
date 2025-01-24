import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const FinancialChart = () => {
  const [revenueData, setRevenueData] = useState({ labels: [], data: [] });
  const [balanceData, setBalanceData] = useState({ labels: [], data: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFinancialData = async () => {
      const apiKey = import.meta.env.VITE_URL_BACKEND;
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vous n'êtes pas connecté.");
        return;
      }

      try {
        const revenueResponse = await axios.get(`${apiKey}/all-transactions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const revenueTransactions = revenueResponse.data.transactions.filter(
          (tx) => tx.revenue && !tx.transfer
        );

        const months = [];
        const revenues = [];
        revenueTransactions.forEach((tx) => {
          const month = new Date(tx.created_at).toLocaleString("fr-FR", {
            month: "long",
            year: "numeric",
          });
          const amount = tx.amount;

          if (!months.includes(month)) {
            months.push(month);
            revenues.push(amount);
          } else {
            const monthIndex = months.indexOf(month);
            revenues[monthIndex] += amount;
          }
        });

        setRevenueData({
          labels: months,
          data: revenues,
        });

        const balanceResponse = await axios.get(`${apiKey}/balance-over-time/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (balanceResponse.data && balanceResponse.data.months && balanceResponse.data.balance) {
          setBalanceData({
            labels: balanceResponse.data.months,
            data: balanceResponse.data.balance,
          });
        } else {
          setError("Données de balance manquantes.");
        }

      } catch (err) {
        setError("Erreur lors de la récupération des données financières.");
        console.error(err);
      }
    };

    fetchFinancialData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      },
    },
  };

  return (
    <div style={{
      width: "60%",
      margin: "20px auto",
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
    }}>
      {error && <div style={{
        color: "red",
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: "20px"
      }}>
        {error}
      </div>}

      <h2 style={{ textAlign: "center", color: "#333", fontSize: "24px", marginBottom: "20px" }}>
        Évolution des Revenus
      </h2>
      {revenueData.labels.length > 0 && revenueData.data.length > 0 ? (
        <Line
          data={{
            labels: revenueData.labels,
            datasets: [
              {
                label: "Revenus",
                data: revenueData.data,
                borderColor: "#42A5F5",
                backgroundColor: "rgba(66, 165, 245, 0.2)",
                borderWidth: 2,
                tension: 0.4,
              },
            ],
          }}
          options={chartOptions}
        />
      ) : (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>Aucune donnée de revenus disponible.</p>
      )}

      <h2 style={{ textAlign: "center", color: "#333", fontSize: "24px", marginBottom: "20px" }}>
        Évolution de la Balance
      </h2>
      {balanceData.labels.length > 0 && balanceData.data.length > 0 ? (
        <Line
          data={{
            labels: balanceData.labels,
            datasets: [
              {
                label: "Balance",
                data: balanceData.data,
                borderColor: "#FF7043",
                backgroundColor: "rgba(255, 112, 67, 0.2)",
                borderWidth: 2,
                tension: 0.4,
              },
            ],
          }}
          options={chartOptions}
        />
      ) : (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>Aucune donnée de balance disponible.</p>
      )}
    </div>
  );
};

export default FinancialChart;

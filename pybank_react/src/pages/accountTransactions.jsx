import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AccountTransactions = () => {
  const { accountId } = useParams(); 
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  async function fetchTransactions() {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem("Token");

    try {
      const response = await fetch(`${apiKey}/${accountId}/transactions/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Erreur lors de la récupération des transactions"
        );
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wider bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          Transactions du compte #{accountId}
        </h1>
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-lg">
            {error}
          </div>
        )}
        {transactions ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-200">Envoyées :</h2>
            {transactions.sent_transactions.length > 0 ? (
              transactions.sent_transactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-10 border border-gray-700 rounded-xl p-4"
                >
                  <p>
                    <strong>Destinataire :</strong> {tx.receiver}
                  </p>
                  <p>
                    <strong>Montant :</strong>{" "}
                    <span className="text-red-400">{tx.amount} €</span>
                  </p>
                  <p>
                    <strong>Date :</strong> {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>Aucune transaction envoyée.</p>
            )}

            <h2 className="text-2xl font-bold mb-4 text-gray-200">Reçues :</h2>
            {transactions.received_transactions.length > 0 ? (
              transactions.received_transactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-10 border border-gray-700 rounded-xl p-4"
                >
                  <p>
                    <strong>Expéditeur :</strong> {tx.sender}
                  </p>
                  <p>
                    <strong>Montant :</strong>{" "}
                    <span className="text-green-400">{tx.amount} €</span>
                  </p>
                  <p>
                    <strong>Date :</strong> {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>Aucune transaction reçue.</p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400">Chargement des transactions...</p>
        )}
      </div>
    </div>
  );
};

export default AccountTransactions;

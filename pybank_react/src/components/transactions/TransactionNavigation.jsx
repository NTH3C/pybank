import { useState, useEffect } from "react";
import SearchBar from "./SearchBar"; // Import your SearchBar component

const TransactionNavigation = ({ selectedAccount }) => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [error, setError] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  async function fetchAllTransactions(query = "") {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous n'êtes pas connecté.");
      return;
    }

    try {
      const response = await fetch(`${apiKey}/all-transactions/${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la récupération des transactions");
      }

      const data = await response.json();
      setAllTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchAllTransactions(searchQuery); // Fetch transactions with the search query
  }, [searchQuery]); // Re-fetch when searchQuery changes

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    console.log(`Switched to ${tab}`);
  };

  const handleSearch = (query) => {
    setSearchQuery(query); // Update the search query state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wider bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          Toutes les transactions
        </h1>
        
        {/* Search Bar Component */}
        <SearchBar onSearch={handleSearch} />

        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-6">
          <nav className="flex justify-between">
            <button
              onClick={() => handleTabChange("transactions")}
              className={`p-3 rounded-lg transition-all duration-300 ${activeTab === "transactions" ? "bg-blue-500" : "hover:bg-gray-700"}`}
            >
              Transactions
            </button>
            <button
              onClick={() => handleTabChange("recettes")}
              className={`p-3 rounded-lg transition-all duration-300 ${activeTab === "recettes" ? "bg-blue-500" : "hover:bg-gray-700"}`}
            >
              Recettes
            </button>
            <button
              onClick={() => handleTabChange("depenses")}
              className={`p-3 rounded-lg transition-all duration-300 ${activeTab === "depenses" ? "bg-blue-500" : "hover:bg-gray-700"}`}
            >
              Dépenses
            </button>
          </nav>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-lg">
            {error}
          </div>
        )}

        {/* Conditional Rendering Based on Active Tab */}
        {activeTab === "transactions" && (
          <div className="grid grid-cols-1 gap-8">
            {allTransactions.length === 0 ? (
              <p className="text-center text-gray-400">Aucune transaction trouvée.</p>
            ) : (
              allTransactions
                .filter(tx => selectedAccount === 0 || tx.sender === selectedAccount || tx.receiver === selectedAccount)
                .map((tx, index) => (
                  <div
                    key={index}
                    className="transaction-item bg-white bg-opacity-10 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-transform duration-300 backdrop-blur-md shadow-lg"
                  >
                    <p>
                      <strong>Expéditeur :</strong> {tx.sender}
                    </p>
                    <p>
                      <strong>Montant :</strong>{" "}
                      <span
                        className={`${
                          tx.revenue ? "text-green-400" : "text-red-400"
                        } ${tx.transfer ? "text-white" : ""}`}
                      >
                        {tx.transfer
                          ? `${tx.amount} €`
                          : tx.revenue
                          ? `+${tx.amount} €`
                          : `-${tx.amount} €`}
                      </span>
                    </p>
                    <p>
                      <strong>Date :</strong>{" "}
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                    <p>{tx.transfer ? <span>&#8646;</span> : null}</p>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === "recettes" && (
          <div className="grid grid-cols-1 gap-8">
            {allTransactions.filter(tx => (selectedAccount === 0 ? tx.revenue && !tx.transfer : tx.receiver === selectedAccount && !tx.transfer)).length === 0 ? (
              <p className="text-center text-gray-400">Aucune recette.</p>
            ) : (
              allTransactions.map((tx, index) =>
                (selectedAccount === 0 ? tx.revenue && !tx.transfer : tx.receiver === selectedAccount && !tx.transfer) && (
                  <div
                    key={index}
                    className="transaction-item bg-white bg-opacity-10 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-transform duration-300 backdrop-blur-md shadow-lg"
                  >
                    <p>
                      <strong>Expéditeur :</strong> {tx.sender}
                    </p>
                    <p>
                      <strong>Montant :</strong>{" "}
                      <span className="text-green-400">+{tx.amount} €</span>
                    </p>
                    <p>
                      <strong>Date :</strong>{" "}
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        )}

        {activeTab === "depenses" && (
          <div className="grid grid-cols-1 gap-8">
            {allTransactions.filter(tx => (selectedAccount === 0 ? !tx.revenue && !tx.transfer : tx.sender === selectedAccount && !tx.transfer)).length === 0 ? (
              <p className="text-center text-gray-400">Aucune dépense.</p>
            ) : (
              allTransactions.map((tx, index) =>
                (selectedAccount === 0 ? !tx.revenue && !tx.transfer : tx.sender === selectedAccount && !tx.transfer) && (
                  <div
                    key={index}
                    className="transaction-item bg-white bg-opacity-10 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-transform duration-300 backdrop-blur-md shadow-lg"
                  >
                    <p>
                      <strong>Expéditeur :</strong> {tx.sender}
                    </p>
                    <p>
                      <strong>Montant :</strong>{" "}
                      <span className="text-red-400">-{tx.amount} €</span>
                    </p>
                    <p>
                      <strong>Date :</strong>{" "}
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionNavigation;
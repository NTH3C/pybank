import { useEffect, useState } from "react";
import SearchBar from "./SearchBar"; // Import your SearchBar component
import PdfDropdown from "./PdfDropdown";

const TransactionNavigation = ({ selectedAccount }) => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [error, setError] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [loading, setLoading] = useState(true); // State for loading

  async function fetchAllTransactions(query = "") {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous n'êtes pas connecté.");
      setLoading(false);
      return;
    }

    setLoading(true); // Start loading

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
    } finally {
      setLoading(false); // End loading
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
    <div className="">
      <div className="">
        {/* Search Bar Component */}
        <div className="flex items-center justify-between space-x-4">
  <PdfDropdown />
  <SearchBar onSearch={handleSearch} />
</div>

        <div className="bg-gray-100 text-gray-800 p-2 rounded-lg shadow-lg mb-6">
          <nav className="flex justify-start gap-x-4">
            <button
              onClick={() => handleTabChange("transactions")}
              className={`p-3 rounded-lg transition-all duration-300 ${activeTab === "transactions" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              Transactions
            </button>
            <button
              onClick={() => handleTabChange("recettes")}
              className={`p-3 rounded-lg transition-all duration-300 ${activeTab === "recettes" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              Recettes
            </button>
            <button
              onClick={() => handleTabChange("depenses")}
              className={`p-3 rounded-lg transition-all duration-300 ${activeTab === "depenses" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              Dépenses
            </button>
          </nav>
        </div>
  
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
  
        {/* Loading State */}
        {loading ? (
          <p className="text-left text-gray-500">Chargement des transactions...</p>
        ) : (
          <>
            {activeTab === "transactions" && (
              <div className="grid grid-cols-1 gap-8">
                {allTransactions.length === 0 ? (
                  <p className="text-left text-gray-500">Aucune transaction trouvée.</p>
                ) : (
                  allTransactions
                    .filter(tx => selectedAccount === 0 || tx.sender === selectedAccount || tx.receiver === selectedAccount)
                    .map((tx, index) => (
                      <div
                        key={index}
                        className="transaction-item bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <p>
                          <strong>Expéditeur :</strong> {tx.sender}
                        </p>
                        <p>
                          <strong>Montant :</strong>{" "}
                          <span
                            className={`${
                              tx.revenue ? "text-green-500" : "text-red-500"
                            } ${tx.transfer ? "text-gray-800" : ""}`}
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
                  <p className="text-left text-gray-500">Aucune recette.</p>
                ) : (
                  allTransactions.map((tx, index) =>
                    (selectedAccount === 0 ? tx.revenue && !tx.transfer : tx.receiver === selectedAccount && !tx.transfer) && (
                      <div
                        key={index}
                        className="transaction-item bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <p>
                          <strong>Expéditeur :</strong> {tx.sender}
                        </p>
                        <p>
                          <strong>Montant :</strong>{" "}
                          <span className="text-green-500">+{tx.amount} €</span>
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
                  <p className="text-left text-gray-500">Aucune dépense.</p>
                ) : (
                  allTransactions.map((tx, index) =>
                    (selectedAccount === 0 ? !tx.revenue && !tx.transfer : tx.sender === selectedAccount && !tx.transfer) && (
                      <div
                        key={index}
                        className="transaction-item bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <p>
                          <strong>Expéditeur :</strong> {tx.sender}
                        </p>
                        <p>
                          <strong>Montant :</strong>{" "}
                          <span className="text-red-500">-{tx.amount} €</span>
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
          </>
        )}
      </div>
    </div>
  );  
};

export default TransactionNavigation;
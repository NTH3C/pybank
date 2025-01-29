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
        {/* Search Bar and PDF Dropdown */}
        <div className="flex items-center justify-between space-x-4">
          <PdfDropdown />
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Navigation Tabs */}
        <div className="border bg-gray-100 text-gray-800 p-2 rounded-lg shadow-lg mb-6">
          <nav className="flex justify-start gap-x-4">
            {["transactions", "recettes", "depenses"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Message */}
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
            {["transactions", "recettes", "depenses"].map((tab) => (
              activeTab === tab && (
                <div className="grid grid-cols-1 gap-8" key={tab}>
                  {allTransactions.filter((tx) => {
                    if (tab === "transactions") {
                      return selectedAccount === 0 || tx.sender === selectedAccount || tx.receiver === selectedAccount;
                    } else if (tab === "recettes") {
                      return selectedAccount === 0 ? tx.revenue && !tx.transfer : tx.receiver === selectedAccount && !tx.transfer;
                    } else if (tab === "depenses") {
                      return selectedAccount === 0 ? !tx.revenue && !tx.transfer : tx.sender === selectedAccount && !tx.transfer;
                    }
                    return false;
                  }).length === 0 ? (
                    <p className="text-left text-gray-500">
                      {`Aucune ${tab === "transactions" ? "transaction" : tab}.`}
                    </p>
                  ) : (
                    Object.entries(
                      allTransactions
                        .filter((tx) => {
                          if (tab === "transactions") {
                            return selectedAccount === 0 || tx.sender === selectedAccount || tx.receiver === selectedAccount;
                          } else if (tab === "recettes") {
                            return selectedAccount === 0 ? tx.revenue && !tx.transfer : tx.receiver === selectedAccount && !tx.transfer;
                          } else if (tab === "depenses") {
                            return selectedAccount === 0 ? !tx.revenue && !tx.transfer : tx.sender === selectedAccount && !tx.transfer;
                          }
                          return false;
                        })
                        .reduce((acc, tx) => {
                          const month = new Date(tx.created_at).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          });
                          acc[month] = acc[month] || [];
                          acc[month].push(tx);
                          return acc;
                        }, {})
                    ).map(([month, transactions]) => (
                      <div key={month}>
                        <h3 className="text-lg font-semibold text-gray-600 mb-4">{month}</h3>
                        {transactions.map((tx, index) => (
                          <div
                            key={index}
                            className="transaction-item bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 mb-4"
                          >
                            <p>
                              <strong>Expéditeur :</strong> {tx.sender}
                            </p>
                            <p>
                              <strong>Montant :</strong>{" "}
                              <span
                                className={`${
                                  tab === "recettes"
                                    ? "text-green-500"
                                    : tab === "depenses"
                                    ? "text-red-500"
                                    : tx.transfer
                                    ? "text-gray-800"
                                    : tx.revenue
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {tab === "recettes"
                                  ? `+${tx.amount} €`
                                  : tab === "depenses"
                                  ? `-${tx.amount} €`
                                  : tx.transfer
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
                            {tx.transfer && (
                              <small className="text-gray-600 text-sm">
                                &#8646; transfert entre vos comptes
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionNavigation;

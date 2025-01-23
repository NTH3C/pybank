import { useEffect, useState } from "react";

import TransactionNavigation from "../components/transactions/TransactionNavigation";
import AccountDropdown from "../components/transactions/AccountDropdown";

const MyAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(0); // State for the selected account (0 = no account selected)
  const [error, setError] = useState("");

  const handleSelect = (selectedOption) => {
    setSelectedAccount(selectedOption); // Update the selected account
    console.log("Selected account value:", selectedOption); // id du compte
  };

  async function fetchAccounts() {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous n'êtes pas connecté.");
      return;
    }

    try {
      const response = await fetch(`${apiKey}/my_accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Erreur lors de la récupération des comptes"
        );
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Prepare dropdown options
  const dropdownOptions = [
    { label: "All Accounts", value: 0},
    ...accounts.map((account) => ({
      label: account.name, // Display name in the dropdown
      value: account.id, // Account ID as the value
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wider bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
        Mon Compte
      </h1>

      {/* Account Dropdown */}
      <AccountDropdown
        options={dropdownOptions}
        onSelect={handleSelect}
      />

      {/* Error Handling */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-lg">
          {error}
        </div>
      )}

      {/* Transaction Navigation */}
      <TransactionNavigation selectedAccount={selectedAccount} />
    </div>
  );
};

export default MyAccount;
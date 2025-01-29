import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import TransactionNavigation from "../components/transactions/TransactionNavigation";
import AccountDropdown from "../components/transactions/AccountDropdown";

const Transactions = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(0); // State for the selected account (0 = no account selected)

  const { accountId } = useParams(); // Get the accountId from the URL

  // Effect to set selectedAccount based on accountId
  useEffect(() => {
    if (accountId) {
      setSelectedAccount(parseInt(accountId, 10)); // Convert to integer and set selectedAccount
    } else {
      setSelectedAccount(0); // Reset to 0 if no accountId is present
    }
  }, [accountId]); // Run this effect when accountId changes

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
    { label: "All Accounts", value: 0 },
    ...accounts.map((account) => ({
      label: account.name, // Display name in the dropdown
      value: account.id, // Account ID as the value
    })),
  ];

  return (
    <div className="w-[95%] my-12">
  <div className="">
    <div className="flex justify-between items-center"> {/* Added `items-center` */}
      <h1 className="font-bold text-gray-800 text-4xl mb-6">
        Transactions
      </h1>
      <AccountDropdown options={dropdownOptions} onSelect={handleSelect} />
    </div>

    {/* Error Handling */}
    {error && (
      <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-600 rounded-lg">
        {error}
      </div>
    )}

    {/* Transaction Navigation */}
    <TransactionNavigation selectedAccount={selectedAccount} />
  </div>
</div>

  );
};

export default Transactions;
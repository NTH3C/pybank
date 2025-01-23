import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccounts } from "../api/accounts/fetchAccounts";

const MyAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAccounts() {
      try {
        const accountsData = await fetchAccounts();
        setAccounts(accountsData);
      } catch (err) {
        setError(err.message);
      }
    }

    loadAccounts();
  }, []);

  async function handleDeleteAccount(accountId, accountName) {
    const apiKey = import.meta.env.VITE_URL_BACKEND; // Endpoint de suppression
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vous n'êtes pas connecté.");
      return;
    }

    if (accountName == "Main_account") {
      setError("Vous ne pouvez pas supprimer le compte principal.");
      return;
    }

    try {
      const response = await fetch( (`${apiKey}/delete_account/`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: accountId }), // Envoi de l'ID du compte
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Erreur lors de la suppression du compte"
        );
      }

      // Mise à jour de la liste des comptes après suppression
      setAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== accountId)
      );

    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wider bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          Mes Comptes
        </h1>
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-lg">
            {error}
          </div>
        )}
        {accounts.length === 0 && !error ? (
          <p className="text-center text-gray-400">
            Aucun compte trouvé. Veuillez vérifier votre connexion ou ajouter un
            compte.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white bg-opacity-10 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-transform duration-300 backdrop-blur-md shadow-lg"
              >
                <h2 className="text-2xl font-semibold mb-2 text-blue-400">
                  {account.name}
                </h2>
                <p className="text-gray-300 mb-2">
                  <strong>Numéro de compte :</strong> {account.id}
                </p>
                <p className="text-gray-300 mb-4">
                  <strong>Solde :</strong>{" "}
                  <span className="text-green-400 font-bold">
                    {account.balance.toLocaleString()} €
                  </span>
                </p>
                <button
                  onClick={() =>
                    navigate(`/account/${account.id}/transactions`)
                  }
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-bold transition-opacity duration-300"
                >
                  Voir les transactions
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id, account.name)}
                  className="w-full py-2 px-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white font-bold transition-opacity duration-300 mt-2"
                >
                  Supprimer le compte
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccounts } from "../api/accounts/fetchAccounts";
import { IoListOutline, IoGridOutline, IoEyeOutline, IoTrashOutline } from "react-icons/io5"; // Importing icons from io5

const MyAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [isTableView, setIsTableView] = useState(false); // Set default to block view
  const [showConfirm, setShowConfirm] = useState(false); // State for confirmation dialog
  const [accountToDelete, setAccountToDelete] = useState(null); // State for the account to delete
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

    if (accountName === "Main_account") {
      setError("Vous ne pouvez pas supprimer le compte principal.");
      return;
    }

    try {
      const response = await fetch(`${apiKey}/delete_account/`, {
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

  const totalBalance = accounts.reduce((total, account) => total + account.balance, 0);

  const confirmDelete = (accountId, accountName) => {
    setAccountToDelete({ id: accountId, name: accountName });
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      handleDeleteAccount(accountToDelete.id, accountToDelete.name);
      setShowConfirm(false);
      setAccountToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setAccountToDelete(null);
  };

  return (
    <div className="w-[95%] my-12">
      <h1 className="text-4xl font-bold mb-4">Mes Comptes</h1>
      {error && (
        <div className="mb-4 text-red-500">
          {error}
        </div>
      )}
      {accounts.length === 0 && !error ? (
        <p className="text-center text-gray-400">
          Aucun compte trouvé. Veuillez vérifier votre connexion ou ajouter un compte.
        </p>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center mb-8">
            <p className="text-m text-gray-600">Total des actifs: {totalBalance.toLocaleString()} €</p>
            <button
              onClick={() => setIsTableView(!isTableView)}
              className="text-2xl"
            >
              {isTableView ? (
                <IoGridOutline className="mr-2 text-gray-600" /> // Icon for block view
              ) : (
                <IoListOutline className="mr-2 text-gray-600" /> // Icon for table view
              )}
            </button>
          </div>
          {isTableView ? (
            <table className="w-full bg-white border border-gray-300"> {/* Set table to full width */}
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Nom du compte</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Numéro de compte</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Solde</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-gray-300 text-zinc-800">{account.name}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-zinc-600">{account.id}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-zinc-600">
                      <span className="text-green-600">{account.balance.toLocaleString()} €</span>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      <div className="flex space-x-4 flex-end justify-end">
                        <button
                          onClick={() => navigate(`/account/${account.id}/transactions`)}
                          className="text-zinc-800 hover:text-zinc-700 transition duration-200"
                        >
                          <IoEyeOutline className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => confirmDelete(account.id, account.name)}
                          className="text-red-600 hover:text-red-500 transition duration-200"
                        >
                          <IoTrashOutline className="w-6 h-6" /> {/* Red trash icon */}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-wrap space-x-4"> {/* Flex container for account blocks */}
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border border-zinc-300 rounded-lg bg-white shadow-md flex-1 max-w-[20rem] h-[10rem]" // Flex item with min and max width
                >
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-zinc-800">{account.name}</h2>
                    <p className="text-zinc-600">
                      <strong>Numéro de compte :</strong> {account.id}
                    </p>
                    <p className="text-zinc-600">
                      <strong>Solde :</strong>{" "}
                      <span className="text-green-600">{account.balance.toLocaleString()} €</span>
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => navigate(`/account/${account.id}/transactions`)}
                      className="border border-zinc-800 bg-transparent hover:bg-zinc-800 hover:text-white font-semibold py-1 px-2 rounded transition duration-200"
                    >
                      Voir les transactions
                    </button>
                    <button
                      onClick={() => confirmDelete(account.id, account.name)}
                      className="text-red-600 hover:text-red-500 transition duration-200"
                    >
                      <IoTrashOutline className="w-6 h-6" /> {/* Red trash icon */}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer le compte "{accountToDelete?.name}" ?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-1 px-3 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
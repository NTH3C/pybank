import React, { useEffect, useState } from 'react';

const MyAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');

  async function fetchAccounts() {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem('token'); 
    if (!token) {
      setError("Vous n'êtes pas connecté.");
      return;
    }
    
    try {
      const response = await fetch(`${apiKey}/my_accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la récupération des comptes');
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

  return (
    <div>
      <h1>Mes Comptes</h1>
      {error && <p className="error">{error}</p>}
      {accounts.length === 0 && !error ? (
        <p>Aucun compte trouvé.</p>
      ) : (
        <ul>
          {accounts.map((account) => (
            <li key={account.id}>
              <h2>{account.name}</h2>
              <p><strong>Numéro de compte :</strong> {account.id}</p>
              <p><strong>Solde :</strong> {account.balance} €</p>
              <button onClick={() => console.log(`Afficher transactions pour ${account.id}`)}>
                Voir les transactions
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyAccount;

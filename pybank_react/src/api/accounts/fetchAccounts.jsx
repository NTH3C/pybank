

//* fetchAccounts for myaccounts.jsx / makeTransactions.jsx
export async function fetchAccounts() {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem("token");
  
    if (!token) {
      throw new Error("Vous n'êtes pas connecté.");
    }
  
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
    return data.accounts || [];
  }
  
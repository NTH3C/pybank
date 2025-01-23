import { useEffect, useState } from "react";
import api from "../api";

const Transaction = () => {
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [sentTransactions, setSentTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const fetchAllTransactions = async () => {
    try {
      const response = await api.get("/5/transactions");
      setReceivedTransactions(response.data.received_transactions);
      setSentTransactions(response.data.sent_transactions);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const fetchMyAccounts = async () => {
    try {
      const response = await api.post("/my-accounts", {}, {
		headers: {
			Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsQGdtYWlsLmNvbSIsImlkIjo3fQ.BDJwpPhYUbjtDWk0Ok8z8KWJoNdGDWateVSfTPvB16Y"
		}
	  });
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
    fetchMyAccounts();
  }, []);

  console.log(accounts)

  return (
    <div className="bg-slate-200">
      <h1>Transactions</h1>

	  <h2>ALL</h2>
      <ul>
        {sentTransactions && sentTransactions.length > 0 ? (
          sentTransactions.map((transaction, index) => (
            <li key={index}>{JSON.stringify(transaction)}</li>
          ))
        ) : (
          <p>No results</p>
        )}
      </ul>

      <h2>Dépenses</h2>
      <ul>
        {sentTransactions && sentTransactions.length > 0 ? (
          sentTransactions.map((transaction, index) => (
            <li key={index}>{JSON.stringify(transaction)}</li>
          ))
        ) : (
          <p>No results</p>
        )}
      </ul>

      <h2>Recettes</h2>
      <ul>
        {receivedTransactions && receivedTransactions.length > 0 ? (
          receivedTransactions.map((transaction, index) => (
            <li key={index}>{JSON.stringify(transaction)}</li>
          ))
        ) : (
          <p>No results</p>
        )}
      </ul>
    </div>
  );
};

export default Transaction;

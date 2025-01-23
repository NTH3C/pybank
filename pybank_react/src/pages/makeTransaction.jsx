import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import axios from "axios";
import { fetchAccounts } from "../api/accounts/fetchAccounts";

const MakeTransaction = () => {
  const [accounts, setAccounts] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [error, setError] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const token = localStorage.getItem("token");
  const apiKey = import.meta.env.VITE_URL_BACKEND; // Endpoint de suppression

  // Fetch all beneficiaries
  const fetchAllBeneficiaires = async () => {
    try {
      const response = await axios.get(`${apiKey}/beneficiaires`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setBeneficiaires(response.data.beneficiaires || []);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error.response?.data || error.message);
      setError(error.response?.data?.detail || "Failed to fetch beneficiaries.");
    }
  };

  // Load accounts and beneficiaries
  useEffect(() => {
    async function loadInitialData() {
      try {
        const accountsData = await fetchAccounts();
        setAccounts(accountsData);
        await fetchAllBeneficiaires();
      } catch (err) {
        setError(err.message);
      }
    }
    loadInitialData();
  }, []);

  const handleTransaction = async (values) => {
    try {
      const response = await axios.post(
        `${apiKey}/make-transaction/`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.data.id) {
        throw new Error("Transaction response does not contain an ID."); // Vérification explicite
      }
  
      setCurrentTransaction(response.data); // Sauvegarder les détails de la transaction, y compris l'ID
      setToastVisible(true); // Afficher le toast
  
      console.log("Transaction Success:", response.data);
  
      // Automatiquement confirmer après 5 secondes
      setTimeout(() => {
        if (toastVisible) {
          confirmTransaction(); // Confirmer seulement si le toast est visible
        }
      }, 5000);
    } catch (error) {
      console.error("Transaction Error:", error.response?.data || error.message);
      setError("Failed to make the transaction.");
    }
  };
  

  // Confirm transaction
  const confirmTransaction = () => {
    setToastVisible(false);
    console.log("Transaction confirmed:", currentTransaction);
    setCurrentTransaction(null); // Clear transaction data
  };

  // cancel transaction
  const cancelTransaction = async () => {
    if (!currentTransaction || !currentTransaction.id) {
      console.error("No valid transaction to cancel.");
      return;
    }
  
    try {
      const cancelResponse = await axios.post(
        `${apiKey}/delete_transaction/`,
        { id: currentTransaction.id }, // Assurez-vous d'envoyer uniquement l'ID
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Transaction undone:", cancelResponse.data);
      setToastVisible(false); // Cacher le toast
      setCurrentTransaction(null); // Réinitialiser la transaction courante
    } catch (error) {
      console.error("Undo Error:", error.response?.data || error.message);
    }
  };
  
  

  return (
    <div className="centered">
      <h1>Make Transaction</h1>
      {error && <p className="error">{error}</p>}

      <Formik
        initialValues={{
          sender: "",
          receiver: "",
          amount: 0,
        }}
        onSubmit={(values) => handleTransaction(values)}
      >
        {(formik) => (
          <Form>
            <label htmlFor="sender">Sender</label>
            <Field as="select" name="sender">
              <option disabled value="">
                Select your account
              </option>
              {accounts.map((account) => (
                <option value={account.id} key={account.id}>
                  {account.name}
                </option>
              ))}
            </Field>

            <label htmlFor="receiver">Receiver</label>
            <Field as="select" name="receiver">
              <option disabled value="">
                Select receiver
              </option>
              {beneficiaires.map((beneficiaire) => (
                <option value={beneficiaire.id} key={beneficiaire.id}>
                  {beneficiaire.name}
                </option>
              ))}
              {accounts.map((account) => (
                <option value={account.id} key={account.id}>
                  {account.name}
                </option>
              ))}
            </Field>

            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              onChange={formik.handleChange}
            />

            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>

      {toastVisible && (
        <div className="toast">
          <p>Transaction pending. cancel within 5 seconds!</p>
          <button onClick={cancelTransaction}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default MakeTransaction;

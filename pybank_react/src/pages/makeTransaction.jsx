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
  const apiKey = import.meta.env.VITE_URL_BACKEND;

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
        throw new Error("Transaction response does not contain an ID.");
      }

      setCurrentTransaction(response.data);
      setToastVisible(true);

      console.log("Transaction Success:", response.data);

      setTimeout(() => {
        if (toastVisible) {
          confirmTransaction();
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

  // Cancel transaction
  const cancelTransaction = async () => {
    if (!currentTransaction || !currentTransaction.id) {
      console.error("No valid transaction to cancel.");
      return;
    }

    try {
      const cancelResponse = await axios.post(
        `${apiKey}/delete_transaction/`,
        { id: currentTransaction.id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Transaction undone:", cancelResponse.data);
      setToastVisible(false);
      setCurrentTransaction(null);
    } catch (error) {
      console.error("Undo Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="w-[95%] my-12">
      <div className="max-w-lg w-full">
        <h1 className="font-bold text-gray-800 text-4xl mb-4">
          Effectuer un virement
        </h1>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-lg">
            {error}
          </div>
        )}

        <Formik
          initialValues={{
            sender: "",
            receiver: "",
            amount: 0,
          }}
          onSubmit={(values) => handleTransaction(values)}
        >
          {(formik) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="sender" className="block text-lg font-medium text-gray-700">
                  Expéditeur
                </label>
                <Field
                  as="select"
                  name="sender"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">
                    Sélectionner votre compte
                  </option>
                  {accounts.map((account) => (
                    <option value={account.id} key={account.id} className="bg-white text-gray-900">
                      {account.name}
                    </option>
                  ))}
                </Field>
              </div>

              <div>
                <label htmlFor="receiver" className="block text-lg font-medium text-gray-700">
                  Bénéficiaire
                </label>
                <Field
                  as="select"
                  name="receiver"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">
                    Sélectionner le bénéficiaire
                  </option>
                  {beneficiaires.map((beneficiaire) => (
                    <option value={beneficiaire.id} key={beneficiaire.id} className="bg-white text-gray-900">
                      {beneficiaire.name}
                    </option>
                  ))}
                  {accounts.map((account) => (
                    <option value={account.id} key={account.id} className="bg-white text-gray-900">
                      {account.name}
                    </option>
                  ))}
                </Field>
              </div>

              <div>
                <label htmlFor="amount" className="block text-lg font-medium text-gray-700">
                  Montant
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0" // Prevents negative values at the HTML level
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value, 10) || 0); // Ensures non-negative values
                    formik.setFieldValue("amount", value);
                  }}
                  value={formik.values.amount}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button type="submit" className="p-3 rounded-lg transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600">
                Envoyer
              </button>
            </Form>
          )}
        </Formik>


        {toastVisible && (
          <div className="fixed bottom-6 right-6 bg-yellow-500 bg-opacity-90 p-4 rounded-lg shadow-lg flex items-center space-x-4">
            <p className="text-white">Transaction en cours. Annulez dans les 5 secondes !</p>
            <button onClick={cancelTransaction} className="bg-red-500 text-white px-4 py-2 rounded-lg">
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeTransaction;

import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import { fetchAccounts } from "../api/accounts/fetchAccounts";

const Prelevement = () => {
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
      setError("Impossible de récupérer les bénéficiaires.");
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
        setError("Erreur lors du chargement des données.");
      }
    }
    loadInitialData();
  }, []);

  const handleTransaction = async (values) => {
    try {
      const response = await axios.post(
        `${apiKey}/make-prelevement/`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.id) {
        throw new Error("La réponse ne contient pas d'ID de transaction.");
      }

      setCurrentTransaction(response.data);
      setToastVisible(true);

      console.log("Transaction réussie :", response.data);

      setTimeout(() => {
        if (toastVisible) {
          confirmTransaction();
        }
      }, 5000);
    } catch (error) {
      console.error("Erreur de transaction :", error.response?.data || error.message);
      setError("Impossible d'effectuer la transaction.");
    }
  };

  const confirmTransaction = () => {
    setToastVisible(false);
    console.log("Transaction confirmée :", currentTransaction);
    setCurrentTransaction(null);
  };

  const cancelTransaction = async () => {
    if (!currentTransaction || !currentTransaction.id) {
      console.error("Aucune transaction valide à annuler.");
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
      console.log("Transaction annulée :", cancelResponse.data);
      setToastVisible(false);
      setCurrentTransaction(null);
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error.response?.data || error.message);
    }
  };

  // Custom validation function
  const validate = (values) => {
    const errors = {};
    if (!values.sender) {
      errors.sender = "Veuillez sélectionner un compte.";
    }
    if (!values.receiver) {
      errors.receiver = "Veuillez sélectionner un bénéficiaire.";
    }
    if (!values.amount || values.amount <= 0) {
      errors.amount = "Le montant doit être supérieur à 0.";
    }
    if (values.delay < 0) {
      errors.delay = "Le délai doit être positif.";
    }
    return errors;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-opacity-90 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">
          Ajouter un prélèvement
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
            amount: "",
            delay: "",
          }}
          validate={validate}
          onSubmit={(values) => handleTransaction(values)}
        >
          {() => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="sender" className="block text-lg font-medium text-gray-700">Expéditeur</label>
                <Field as="select" name="sender" className="w-full mt-2 p-3 rounded-lg border border-gray-600">
                  <option disabled value="">Sélectionner votre compte</option>
                  {accounts.map((account) => (
                    <option value={account.id} key={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="sender" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label htmlFor="receiver" className="block text-lg font-medium text-gray-700">Bénéficiaire</label>
                <Field as="select" name="receiver" className="w-full mt-2 p-3 rounded-lg border border-gray-600">
                  <option disabled value="">Sélectionner un bénéficiaire</option>
                  {beneficiaires.map((beneficiaire) => (
                    <option value={beneficiaire.id} key={beneficiaire.id}>
                      {beneficiaire.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="receiver" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label htmlFor="amount" className="block text-lg font-medium text-gray-700">Montant</label>
                <Field
                  type="number"
                  id="amount"
                  name="amount"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600"
                />
                <ErrorMessage name="amount" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label htmlFor="delay" className="block text-lg font-medium text-gray-700">Délai</label>
                <Field
                  type="number"
                  id="delay"
                  name="delay"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600"
                />
                <ErrorMessage name="delay" component="div" className="text-red-500 text-sm" />
              </div>

              <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300">
                Effectuer la transaction
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Prelevement;

import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const CreateAccount = () => {
  const [createAccounts, setCreateAccounts] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function CreateAccounts(values, resetForm) {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMessage("Vous n'êtes pas connecté.");
      return;
    }

    try {
      if (values) {
        const response = await fetch(`${apiKey}/accounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            name: values.name,
            type: values.type, 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || 'Erreur lors de la création du compte'
          );
        }

        const data = await response.json();
        setSuccessMessage('Compte créé avec succès !');
        resetForm();
      }

      const response = await fetch(`${apiKey}/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 'Erreur lors de la récupération des comptes'
        );
      }

      const data = await response.json();
      setCreateAccounts(data.createAccounts || []);
    } catch (err) {
      setErrorMessage(err.message || "Erreur inconnue");
    }
  }

  function validate(values) {
    const errors = {};
    if (!values.name) {
      errors.name = 'Le nom est requis';
    } else if (values.name.length < 2) {
      errors.name = 'Le nom doit comporter au moins 2 caractères';
    }
    if (!values.type) {
      errors.type = 'Le type de compte est requis';
    }
    return errors;
  }

  useEffect(() => {
    CreateAccounts();
  }, []);

  return (
    <div className="w-[95%] my-12">
      <div className="max-w-lg w-full">
        <h1 className="font-bold text-gray-800 text-4xl mb-4">
          Créer un compte
        </h1>
        
        {/* Affichage du message de succès ou d'erreur */}
        {successMessage && <div className="text-green-500 text-center mb-4 font-semibold">{successMessage}</div>}
        {/* {errorMessage && <div className="text-red-500 text-center mb-4 font-semibold">{errorMessage}</div>} */}

        <Formik
          initialValues={{ name: '', type: '' }}
          validate={validate}
          onSubmit={(values, { resetForm }) => CreateAccounts(values, resetForm)}
        >
          {() => (
            <Form className="">
              <div className="mb-4">
                <label htmlFor="name" className="block text-lg text-gray-700">Nom :</label>
                <Field name="name" type="text" className="w-full p-3 mt-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="mb-4">
                <label htmlFor="type" className="block text-lg text-gray-700">Type de compte :</label>
                <Field as="select" name="type" className="w-full p-3 mt-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="Epargne">Épargne</option>
                  <option value="Courant">Courant</option>
                </Field>
                <ErrorMessage name="type" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <button
                className="p-3 rounded-lg transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600"
                type="submit"
              >
                Créer
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateAccount;

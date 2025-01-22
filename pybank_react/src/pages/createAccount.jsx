import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const CreateAccount = () => {
  const [createAccounts, setCreateAccounts] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  async function CreateAccounts(values, resetForm) {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem('token');

    if (!token) {
      setError("Vous n'êtes pas connecté.");
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
      err.message;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wider bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          Créer un compte
        </h1>
        {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}

        <Formik
          initialValues={{ name: '', type: '' }}
          validate={validate}
          onSubmit={(values, { resetForm }) => CreateAccounts(values, resetForm)}
        >
          {() => (
            <Form>
              <div>
                <label htmlFor="name">Nom :</label>
                <Field name="name" type="text" />
                <ErrorMessage name="name" component="div" style={{ color: 'red' }} />
              </div>
              <div>
                <label htmlFor="type">Type de compte :</label>
                <Field as="select" name="type">
                  <option value="" disabled>
                    Sélectionnez un type
                  </option>
                  <option value="Epargne">Épargne</option>
                  <option value="Courant">Courant</option>
                </Field>
                <ErrorMessage name="type" component="div" style={{ color: 'red' }} />
              </div>
              <button
                className="py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-bold transition-opacity duration-300"
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

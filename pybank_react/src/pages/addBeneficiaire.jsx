import React from "react";
import { Formik, Form } from "formik";
import axios from "axios";

const AddBeneficiaire = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-opacity-90 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">
          Ajouter un Bénéficiaire
        </h1>

        <Formik
          initialValues={{
            name: "",
            account_id: 0,
          }}
          onSubmit={async (values) => {
            const apiKey = import.meta.env.VITE_URL_BACKEND; // Endpoint de suppression

            try {
              const response = await axios.post(
                `${apiKey}/add_beneficiaire`,
                values,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              localStorage.setItem("token", response.data.token);
              console.log("Success:", response.data);
            } catch (error) {
              console.error("Error:", error.response?.data || error.message);
            }
          }}
        >
          {(formik) => (
            <Form className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-gray-700"
                >
                  Nom du Bénéficiaire
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600 bg-transparent text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="account_id"
                  className="block text-lg font-medium text-gray-700"
                >
                  ID du Compte
                </label>
                <input
                  id="account_id"
                  name="account_id"
                  type="number"
                  onChange={formik.handleChange}
                  value={formik.values.account_id}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600 bg-transparent text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
              >
                Ajouter le Bénéficiaire
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddBeneficiaire;

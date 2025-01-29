import React from "react";
import { Formik, Form } from "formik";
import axios from "axios";

const AddBeneficiaire = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="w-[95%] my-12">
      <div className="max-w-lg w-full">
        <h1 className="font-bold text-gray-800 text-4xl mb-4">
          Ajouter un bénéficiaire
        </h1>

        <Formik
          initialValues={{
            name: "",
            account_id: 0,
          }}
          onSubmit={async (values) => {
            const apiKey = import.meta.env.VITE_URL_BACKEND;

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
                  Nom du bénéficiaire
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
                  min="0" // Prevents negative values at the HTML level
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value, 10) || 0); // Ensures non-negative values
                    formik.setFieldValue("account_id", value);
                  }}
                  value={formik.values.account_id}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600 bg-transparent text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="p-3 rounded-lg transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600"
              >
                Ajouter
              </button>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddBeneficiaire;

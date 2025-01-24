import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Utilisation de useNavigate pour rediriger après l'inscription

const Register = () => {
  const navigate = useNavigate(); // Hook de redirection après inscription réussie
  const apiKey = import.meta.env.VITE_URL_BACKEND;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-opacity-90 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">
          Inscription
        </h1>

        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          onSubmit={async (values) => {
            try {
              const response = await axios.post(`${apiKey}/users/`, values, {
                headers: {
                  "Content-Type": "application/json",
                },
              });
              console.log("Inscription réussie:", response.data);
              // Rediriger vers la page de connexion après une inscription réussie
              navigate("/login");
            } catch (error) {
              console.error("Erreur lors de l'inscription:", error.response?.data || error.message);
            }
          }}
        >
          {(formik) => (
            <Form className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-lg font-medium">Adresse Email</label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600 bg-transparent text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-lg font-medium">Mot de passe</label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600 bg-transparent text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
              >
                S'inscrire
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-4 text-center text-sm text-gray-400">
          <p>
            Déjà un compte ?{" "}
            <a href="/login" className="text-blue-400 hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

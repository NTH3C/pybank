import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Utilisation de useNavigate pour la redirection

const Login = () => {
  const navigate = useNavigate(); // Hook de redirection vers la page d'accueil
  const apiKey = import.meta.env.VITE_URL_BACKEND;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-opacity-90 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">
          Connexion
        </h1>

        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          onSubmit={async (values) => {
            try {
              const response = await axios.post(`${apiKey}/login/`, values, {
                headers: {
                  "Content-Type": "application/json",
                },
              });
              localStorage.setItem("token", response.data.token); // Sauvegarde du token dans localStorage
              console.log("Connexion réussie:", response.data);
              // Rediriger vers la page d'accueil après une connexion réussie
              navigate("/");
            } catch (error) {
              console.error("Erreur de connexion:", error.response?.data || error.message);
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
                Se connecter
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-4 text-center text-sm text-gray-400">
          <p>
            Pas encore de compte ?{" "}
            <a href="/register" className="text-blue-400 hover:underline">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

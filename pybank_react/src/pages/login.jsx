import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Utilisation de useNavigate pour la redirection

const Login = () => {
  const navigate = useNavigate(); // Hook de redirection vers la page d'accueil

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-sm mx-auto bg-opacity-90 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">
          Connexion
        </h1>

        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          onSubmit={async (values) => {
            try {
              const response = await axios.post("http://localhost:8000/login/", values, {
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
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full mt-2 p-3 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

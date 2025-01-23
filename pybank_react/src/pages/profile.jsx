import React, { useEffect, useState } from "react";
import { fetchUserInfo } from "../api/profile/me";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import axios from "axios";




const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserInfo() {
      try {
        const userInfo = await fetchUserInfo();
        setUser(userInfo);
      } catch (err) {
        setError(err.message);
      }
    }

    loadUserInfo();
  }, []);

  return (
    console.log(user),
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wider bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          Mon Profil
        </h1>
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-lg">
            {error}
          </div>
        )}
        {!user && !error ? (
          <p className="text-center text-gray-400">
            Chargement des informations utilisateur...
          </p>
        ) : (
          user && (
            <div className="bg-white bg-opacity-10 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-transform duration-300 backdrop-blur-md shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              <strong>Email :</strong> {user.email}
              </h2>
              <p className="text-gray-300 mb-2">
                <strong>ID utilisateur :</strong> {user.id}
              </p>
              <Formik
                initialValues={{
                    old_password: "",
                    new_password: "",
                }}
                onSubmit={async (values) => {
                    try {
                        const response = await axios.put('http://localhost:8000/change_password/',  values,
                        {
                            headers: {
                                'Content-Type': 'application/json', 
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        localStorage.setItem('token',response.data.token)
                        console.log('Success:', response.data);
                        navigate('/login')
                    } catch (error) {
                      console.error('Error:', error.response?.data || error.message);
                    }
                  }}
            >
                {(formik) => (
                    <Form>
                        <label htmlFor="old_password">Old Password</label>
                        <input
                            id="old_password"
                            name="old_password"
                            type="password"
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                        
                        <label htmlFor="new_password">New Password</label>
                        <input
                            id="new_password"
                            name="new_password"
                            type="password"
                            onChange={formik.handleChange}
                            value={formik.values.password}
                        />

                        <button type="submit">Change Password</button>
                    </Form>
                )}
            </Formik>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Profile;

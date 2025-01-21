import React from "react";
import { Formik, Form } from "formik";
import axios from "axios";



const Register = () => {
    return (
        <div className="centered">
            <h1>Login</h1>,
            <Formik
                initialValues={{
                    email: "",
                    password: "",
                }}
                onSubmit={async (values) => {
                    try {
                        const response = await axios.post('http://localhost:8000/login/',  values,
                        {
                            headers: {
                                'Content-Type': 'application/json', 
                            },
                        });
                        localStorage.setItem('Token',response.data)
                        console.log('Success:', response.data);
                    } catch (error) {
                      console.error('Error:', error.response?.data || error.message);
                    }
                  }}
            >
                {(formik) => (
                    <Form>
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                        
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            onChange={formik.handleChange}
                            value={formik.values.password}
                        />

                        <button type="submit">Submit</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Register;
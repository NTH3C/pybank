import React from "react";
import { Formik, Form } from "formik";
import axios from "axios";



const AddBeneficiaire = () => {
    const token = localStorage.getItem("token");
    return (
        <div className="centered">
            <h1>Login</h1>,
            <Formik
                initialValues={{
                    name: "",
                    account_id: 0,
                }}
                onSubmit={async (values) => {
                    try {
                        const response = await axios.post('http://localhost:8000/add_beneficiaire',  values,
                        {
                            headers: {
                                'Content-Type': 'application/json', 
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        localStorage.setItem('token',response.data.token)
                        console.log('Success:', response.data);
                    } catch (error) {
                      console.error('Error:', error.response?.data || error.message);
                    }
                  }}
            >
                {(formik) => (
                    <Form>
                        <label htmlFor="name">Name of the beneficiaire</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                        
                        <label htmlFor="account_id">Account id</label>
                        <input
                            id="account_id"
                            name="account_id"
                            type="number"
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

export default AddBeneficiaire;
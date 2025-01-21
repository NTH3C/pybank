import React from "react";
import { Formik, Form } from "formik";

const Register = () => {
    return (
        <div classname="centered">
            <h1>Inscription</h1>,
            <Formik
                initialValues={{
                    email: "",
                }}
                onSubmit={(values) => {
                    alert(JSON.stringify(values, null, 2));
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

                        <button type="submit">Submit</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Register;
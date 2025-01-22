import React, {useState, useEffect} from "react";
import { Formik, Form, Field} from "formik";
import axios from "axios";
import { fetchAccounts } from "../api/accounts/fetchAccounts";




const MakeTransaction = () => {
    const [accounts, setAccounts] = useState([]);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    
    useEffect(() => {
        async function loadAccounts() {
          try {
            const accountsData = await fetchAccounts();
            setAccounts(accountsData);
          } catch (err) {
            setError(err.message);
          }
        }
    
        loadAccounts();
      }, []);

    return (
        <div className="centered">
            <h1>Make Transaction</h1>,
            <Formik
                initialValues={{
                    sender: "",
                    receiver: "",
                    amount: 0,
                }}
                onSubmit={async (values) => {
                    console.log(values)
                    try {
                        const response = await axios.post('http://localhost:8000/make-transaction/',  values,
                        {
                            headers: {
                                'Content-Type': 'application/json', 
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        console.log('Success:', response.data);
                    } catch (error) {
                      console.error('Error:', error.response?.data || error.message);
                    }
                  }}>


                {(formik) => (
                    <Form>
                        <label htmlFor="sender">Sender</label>
                        <Field 
                        as="select" 
                        name="sender"
                        >
                            <option disabled value="">Select your account</option>
                            {accounts.map((account) => (
                                <option value={account.id} key={account.id}>{account.name}</option>
                            ))}
                        </Field>
                        
                        <label htmlFor="receiver">Receiver</label>
                        <input
                            id="receiver"
                            name="receiver"
                            onChange={formik.handleChange}
                        />

                        <label htmlFor="amount">Amount</label>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            onChange={formik.handleChange}
                        />

                        <button type="submit">Submit</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default MakeTransaction;
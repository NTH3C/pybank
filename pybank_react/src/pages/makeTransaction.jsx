import React, {useState, useEffect} from "react";
import { Formik, Form, Field} from "formik";
import axios from "axios";
import { fetchAccounts } from "../api/accounts/fetchAccounts";




const MakeTransaction = () => {
    const [accounts, setAccounts] = useState([]);
    const [beneficiaires, setBeneficiaires] = useState([]);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    const fetchAllBeneficiaires = async () => {
        try {
          const response = await axios.get("http://localhost:8000/beneficiaires", {
            headers: {
              "Content-Type": "application/json", 
              Authorization: `Bearer ${token}`,   
            },
          });
          setBeneficiaires(response.data.beneficiaires || []); 
        } catch (error) {
          console.error("Error fetching beneficiaries:", error.response?.data || error.message);
          setError(error.response?.data?.detail || "Failed to fetch beneficiaries.");
        }
      };
      
    
    useEffect(() => {
        async function loadInitialData() {
          try {
            const accountsData = await fetchAccounts();
            setAccounts(accountsData);
      
            await fetchAllBeneficiaires(); 
          } catch (err) {
            setError(err.message);
          }
        }
      
        loadInitialData();
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
                        
                        <label htmlFor="sender">Receiver</label>
                        <Field 
                        as="select" 
                        name="receiver"
                        >
                            <option disabled value="">Select receiver</option>
                            {beneficiaires.map((beneficiaire) => (
                                <option value={beneficiaire.id} key={beneficiaire.id}>{beneficiaire.name}</option>
                            ))}
                            {accounts.map((account) => (
                                <option value={account.id} key={account.id}>{account.name}</option>
                            ))}
                        </Field>

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
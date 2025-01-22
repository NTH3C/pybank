
import Transaction from "./pages/transaction";
import { useState } from 'react'

import ReactDOM from "react-dom/client";
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAccount from './pages/myaccount'

import Register from './pages/register'
import Login from './pages/login'
import AccountTransactions from "./pages/accountTransactions";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />}/>
        <Route path="/myaccount" element={<MyAccount />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/transactions" element={<Transaction />} />
        <Route path="/account/:accountId/transactions" element={<AccountTransactions />} />

      </Routes>
    </BrowserRouter>
    
  )
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

            
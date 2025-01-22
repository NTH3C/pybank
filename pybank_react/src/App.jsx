import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Register from './pages/register';
import Login from './pages/login';
import Acceuil from "./pages/acceuil";
import CreateAccount from "./pages/createAccount";
import MyAccount from './pages/myaccount';
import Transaction from "./pages/transaction";
import AccountTransactions from "./pages/accountTransactions";
import ProtectedRoute from "./components/ProtectedRoute";
import MakeTransaction from "./pages/makeTransaction";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Accessible Route */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />



        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Acceuil />} />
          <Route path="/myaccount" element={<MyAccount />} />
          <Route path="/transactions" element={<Transaction />} />
          <Route path="/account/:accountId/transactions" element={<AccountTransactions />} />
          <Route path="/maketransactions" element={<MakeTransaction />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

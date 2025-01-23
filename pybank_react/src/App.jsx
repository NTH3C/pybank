import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Register from './pages/register';
import Login from './pages/login';
import Acceuil from "./pages/acceuil";
import CreateAccount from "./pages/createAccount";
import Transactions from './pages/Transactions';
import MyAccounts from './pages/MyAccounts';
// import Transactions from "./pages/transaction";
// import AccountTransactions from "./pages/accountTransactions";
import ProtectedRoute from "./components/ProtectedRoute";
import MakeTransaction from "./pages/makeTransaction";
import AddBeneficiaire from "./pages/addBeneficiaire";
import Profile from "./pages/profile";


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
          <Route path="/my-accounts/" element={<MyAccounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/account/:accountId/transactions" element={<Transactions />} /> {/* Updated route */}
          <Route path="/myaccount" element={<MyAccounts />} />
          <Route path="/maketransactions" element={<MakeTransaction />} />
          <Route path="/createaccount" element={<CreateAccount />} />
          <Route path="/addbeneficiaire" element={<AddBeneficiaire />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


// <Route path="/account/:accountId/transactions" element={<Transactions />} />
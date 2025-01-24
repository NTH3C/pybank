import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Register from './pages/register';
import Login from './pages/login';
import ProtectedRoute from "./components/ProtectedRoute";

import Acceuil from "./pages/acceuil";
import Profile from "./pages/profile";
import CreateAccount from "./pages/createAccount";
import MyAccounts from './pages/MyAccounts';
import Transactions from './pages/Transactions';
import MakeTransaction from "./pages/makeTransaction";
import AddBeneficiaire from "./pages/addBeneficiaire";
import Prelevement from "./pages/prelevement";

import SideBar from "./components/common/SideBar";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <SideBar />
        <div className="flex-1">
          <Routes>
            {/* Accessible Route */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Acceuil />} />
              <Route path="/my-accounts/" element={<MyAccounts />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/account/:accountId/transactions" element={<Transactions />} />
              <Route path="/maketransactions" element={<MakeTransaction />} />
              <Route path="/createaccount" element={<CreateAccount />} />
              <Route path="/addbeneficiaire" element={<AddBeneficiaire />} />
              <Route path="/prelevement" element={<Prelevement />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
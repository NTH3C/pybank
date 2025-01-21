import { useState } from 'react'
import ReactDOM from "react-dom/client";
import './App.css'
import Register from './pages/register'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAccount from './pages/myaccount'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />}/>
        <Route path="/myaccount" element={<MyAccount />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

              
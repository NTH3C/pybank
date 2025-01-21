import { useState } from 'react'

import ReactDOM from "react-dom/client";
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyAccount from './pages/myaccount'

import Register from './pages/register'
import Login from './pages/login'
import { BrowserRouter, Routes, Route } from "react-router-dom"



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />}/>
        <Route path="/myaccount" element={<MyAccount />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
    
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

              
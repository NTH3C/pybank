import { useState } from 'react'
import './App.css'
import Register from './pages/register'
import Login from './pages/login'
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App

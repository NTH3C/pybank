import React from 'react'
import { useNavigate } from 'react-router-dom';



function acceuil() {
    const navigate = useNavigate();
    return (
        <div className=''>
            <h1>ACCEUIL</h1>,
            <button onClick={() => navigate('/register')}>
                register
            </button>
            <button onClick={() => navigate('/login')}>
                Login
            </button>
            <button onClick={() => navigate('/myaccount')}>
                myaccount
            </button>
            <button onClick={() => navigate('/transactions')}>
                transactions
            </button>
            <button onClick={() => navigate('/create')}>
                creer un compte
            </button>
        </div>
  )
}

export default acceuil

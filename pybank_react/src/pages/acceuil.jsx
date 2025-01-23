import React from 'react'
import { useNavigate } from 'react-router-dom';
import Linechart from '../components/chart/lineChart'

function acceuil() {
    const navigate = useNavigate();
    return (
        <div className=''>
            

            <h1>ACCEUIL</h1>,
            <button className='w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-bold transition-opacity duration-300' onClick={() => navigate('/register')}>
                register
            </button>
            <button className='w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-bold transition-opacity duration-300' onClick={() => navigate('/login')}>
                Login
            </button>
            <button className='w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-bold transition-opacity duration-300' onClick={() => navigate('/myaccount')}>
                myaccount
            </button>
            <button className='w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-bold transition-opacity duration-300' onClick={() => navigate('/transactions')}>
                transactions
            </button>
            <button onClick={() => navigate('/createaccount')}>
                creer un compte
            </button>
            <Linechart/>
        </div>
  )
}

export default acceuil

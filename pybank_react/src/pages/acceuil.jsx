import React from 'react';
import { useNavigate } from 'react-router-dom';
import Linechart from '../components/chart/lineChart';

function Acceuil() {
    const navigate = useNavigate();
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">Bienvenue sur Pybank</h1>
            <Linechart />
        </div>
    );
}

export default Acceuil;

import React from 'react';
import Linechart from '../components/chart/lineChart';

function Acceuil() {
    return (
        <div className="w-[95%] my-12">
            <h1 className="font-bold text-gray-800 text-4xl mb-4">Dashboard</h1>
            <Linechart />
        </div>
    );
}

export default Acceuil;

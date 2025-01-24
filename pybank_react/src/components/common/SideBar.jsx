import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDashboard, MdSwapHoriz, MdAccountCircle, MdAttachMoney } from 'react-icons/md'; // Importing Material Design icons

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {/* Hamburger Icon for Mobile */}
      <button
        className="md:hidden p-4 text-white"
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Side Menu */}
      <aside className={`fixed left-0 top-0 w-64 h-full sidebar-background text-zinc-200 border-r-2 border-zinc-700 transition-transform duration-300 p-2 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Pybank</h1>
          <button className="md:hidden" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-4">
          <ul>
          <li>
              <Link to="/" className="flex items-center py-2 px-4 transition-colors duration-300 hover:bg-zinc-800 rounded">
                <MdDashboard className="mr-2" /> {/* Dashboard Icon */}
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/my-accounts" className="flex items-center py-2 px-4 transition-colors duration-300 hover:bg-zinc-800 rounded">
                <MdAccountCircle className="mr-2" /> {/* My Account Icon */}
                Mes comptes
              </Link>
            </li>
            <li>
              <Link to="/createaccount" className="flex items-center py-2 px-4 transition-colors duration-300 hover:bg-zinc-800 rounded">
                <MdDashboard className="mr-2" /> {/* Dashboard Icon */}
                Créer un compte
              </Link>
            </li>
            <li>
              <Link to="/maketransactions" className="flex items-center py-2 px-4 transition-colors duration-300 hover:bg-zinc-800 rounded">
                <MdAttachMoney className="mr-2" /> {/* Virements Icon */}
                Virements
              </Link>
            </li>
            <li>
              <Link to="/transactions" className="flex items-center py-2 px-4 transition-colors duration-300 hover:bg-zinc-800 rounded">
                <MdSwapHoriz className="mr-2" /> {/* Transactions Icon */}
                Mes transactions
              </Link>
            </li>
            <li>
              <Link to="/addbeneficiaire" className="flex items-center py-2 px-4 transition-colors duration-300 hover:bg-zinc-800 rounded">
                <MdAccountCircle className="mr-2" /> {/* My Account Icon */}
                Mes beneficiaire
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 p-6 ml-64"> {/* Add margin-left to account for the sidebar width */}
        {/* Your main content goes here */}
      </div>
    </div>
  );
};

export default SideBar;
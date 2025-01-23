import { useState, useEffect } from "react";
import BankStatement from "./BankStatement";
import { PDFDownloadLink } from '@react-pdf/renderer';


const PdfDropdown = () => {
    const [pdfTransactions, setPdfTransactions] = useState([]); // State for pdf transactions
    const [error, setError] = useState("");

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed, so add 1
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

    async function fetchPdfTransactions(month, year) {
      const apiKey = import.meta.env.VITE_URL_BACKEND;
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous n'êtes pas connecté.");
        return;
      }
  
      try {
        const response = await fetch(`${apiKey}/all-transactions/${year}/${month}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Erreur lors de la récupération des transactions par période.");
        }
  
        const data = await response.json();
        setPdfTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message);
      } 
    }
  
    useEffect(() => {
      fetchPdfTransactions(selectedMonth, selectedYear); // Fetch transactions with the search query
    }, [selectedMonth, selectedYear]); // Re-fetch when searchQuery changes

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-64">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 py-2 px-4 bg-white text-gray-700 border-none focus:outline-none"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <div className="w-px bg-gray-300"></div> {/* Grey line separator */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="flex-1 py-2 px-4 bg-white text-gray-700 border-none focus:outline-none"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <PDFDownloadLink document={<BankStatement transactions={pdfTransactions}/>} fileName={`bank-statement-${selectedYear}-${selectedMonth}.pdf`}
      className="ml-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
      {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download now!')}
    </PDFDownloadLink>

    </div>
  );
};

export default PdfDropdown;
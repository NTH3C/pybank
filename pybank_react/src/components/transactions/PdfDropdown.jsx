import { useState, useEffect } from "react";
import BankStatement from "./BankStatement";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { IoDownloadOutline } from "react-icons/io5";

const PdfDropdown = () => {
  const [pdfTransactions, setPdfTransactions] = useState([]);
  const [error, setError] = useState("");
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
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
    fetchPdfTransactions(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

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

  const toggleMonthDropdown = () => setIsMonthOpen(!isMonthOpen);
  const toggleYearDropdown = () => setIsYearOpen(!isYearOpen);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month.value);
    setIsMonthOpen(false);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setIsYearOpen(false);
  };

  return (
    <div className="flex">
      <div className="relative">
        {/* Combined Dropdown Menu */}
        <div className="flex items-center bg-gray-100 border border-gray-300 rounded-l-lg">
          {/* Month Dropdown */}
          <div className="relative inline-block text-left">
            <button
              className="flex items-center justify-between px-3 py-1.5 w-auto rounded-l-lg text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              onClick={toggleMonthDropdown}
            >
              {months.find(month => month.value === selectedMonth)?.label}
              <svg
                className={`ml-2 w-4 h-4 transform transition-transform ${isMonthOpen ? "rotate-180" : "rotate-0"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMonthOpen && (
              <div className="absolute mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-40 z-10">
                <ul className="py-1">
                  {months.map((month) => (
                    <li
                      key={month.value}
                      className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors duration-200"
                      onClick={() => handleMonthSelect(month)}
                    >
                      {month.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Year Dropdown */}
          <div className="relative inline-block text-left">
            <button
              className="flex items-center justify-between px-3 py-1.5 w-auto text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              onClick={toggleYearDropdown}
            >
              {selectedYear}
              <svg
                className={`ml-2 w-4 h-4 transform transition-transform ${isYearOpen ? "rotate-180" : "rotate-0"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isYearOpen && (
              <div className="absolute mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-40 z-10">
                <ul className="py-1">
                  {years.map((year) => (
                    <li
                      key={year}
                      className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors duration-200"
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Download Button */}
      <PDFDownloadLink
        document={<BankStatement transactions={pdfTransactions} />}
        fileName={`bank-statement-${selectedYear}-${selectedMonth}.pdf`}
        className="py-2 px-4 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center"
      >
        {({ blob, url, loading, error }) =>
          loading ? (
            'Chargement...'
          ) : (
            <IoDownloadOutline className="text-white text-xl" />
          )
        }
      </PDFDownloadLink>
    </div>
  );
};

export default PdfDropdown;

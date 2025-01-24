import { useState } from "react";

const AccountDropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0].label); // Default to the first option's label

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option.label); // Update the displayed label
    onSelect(option.value); // Pass the value of the selected option
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className="relative inline-block text-left">
      <button
        className="flex items-center justify-between bg-gray-100 text-gray-700 px-4 py-2 w-48 rounded-lg border border-gray-300 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
        onClick={toggleDropdown}
      >
        {selectedOption} {/* Display the selected option */}
        <svg
          className={`ml-2 w-4 h-4 transform transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-48 z-10">
          <ul className="py-1">
            {options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors duration-200"
                onClick={() => handleOptionClick(option)}
              >
                {option.label} {/* Display the label */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;

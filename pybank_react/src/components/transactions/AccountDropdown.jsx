import { useState } from "react";

const AccountDropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    onSelect(option.value); // Pass the value of the selected option
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className="relative inline-block text-left">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        onClick={toggleDropdown}
      >
        Options
      </button>

      {isOpen && (
        <div className="absolute mt-2 bg-black border border-gray-200 rounded-lg shadow-lg w-48">
          <ul className="py-1">
            {options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

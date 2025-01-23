import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    onSearch(searchQuery); // Pass the searchQuery to the parent component
  };

  return (
    <div className="flex justify-center my-6">
      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Rechercher..."
          className="w-full py-3 px-6 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 18l6-6-6-6M18 12H4"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;

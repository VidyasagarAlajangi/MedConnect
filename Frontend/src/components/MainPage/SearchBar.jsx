import { Search } from "lucide-react";
import PropTypes from "prop-types";

const SearchBar = ({ searchValue, onSearchChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
    console.log(searchValue);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-full shadow-lg p-4 flex items-center gap-4"
    >
      {/* Search Input */}
      <div className="flex-1">
        <input
          type="text"
          id="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, specialization, or location"
          className="w-full p-3 border border-gray-300 rounded-full text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500  placeholder-white-500"
        />
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="flex items-center justify-center bg-blue-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-full shadow-md transition-all duration-200"
      >
        <Search className="mr-2" /> Search
      </button>
    </form>
  );
};

SearchBar.propTypes = {
  searchValue: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;

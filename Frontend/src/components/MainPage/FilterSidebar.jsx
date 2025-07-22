import { Filter, Star, Briefcase, User } from "lucide-react";
import PropTypes from "prop-types";

const FilterSidebar = ({ filters, onFilterChange }) => {
  const handleAvailabilityChange = (value) => {
    const newValue = filters.isActive === value ? "" : value;
    onFilterChange("isActive", newValue);
  };

  return (
    <div className="w-full md:w-64 bg-black-600 rounded-lg shadow-md overflow-hidden ">
      <div className="bg-gradient-to-r from-blue-300 to-indigo-300 p-4 border-b border-gray-600 ">
        <div className="flex items-center">
          <Filter size={18} className="text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Availability filter - converted to checkboxes */}
        <div className="filter-group">
          <h3 className="font-medium mb-3 flex items-center text-gray-700">
            <User size={16} className="mr-2 text-blue-500" /> Availability
          </h3>
          <div className="space-y-2">
            <div
              className={`flex items-center p-2.5 rounded-md cursor-pointer transition-all border ${
                filters.isActive === "true"
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
              onClick={() => handleAvailabilityChange("true")}
            >
              <div
                className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${
                  filters.isActive === "true"
                    ? "bg-blue-500"
                    : "border border-gray-300"
                }`}
              >
                {filters.isActive === "true" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="text-sm">Available Now</span>
              <div className="ml-auto">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  ✓
                </span>
              </div>
            </div>

            <div
              className={`flex items-center p-2.5 rounded-md cursor-pointer transition-all border ${
                filters.isActive === "false"
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
              onClick={() => handleAvailabilityChange("false")}
            >
              <div
                className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${
                  filters.isActive === "false"
                    ? "bg-blue-500"
                    : "border border-gray-300"
                }`}
              >
                {filters.isActive === "false" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="text-sm">Currently Unavailable</span>
              <div className="ml-auto">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                  ✕
                </span>
              </div>
            </div>

            <div
              className={`flex items-center p-2.5 rounded-md cursor-pointer transition-all border ${
                filters.isActive === ""
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
              onClick={() => handleAvailabilityChange("")}
            >
              <div
                className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${
                  filters.isActive === ""
                    ? "bg-blue-500"
                    : "border border-gray-300"
                }`}
              >
                {filters.isActive === "" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="text-sm">All Doctors</span>
              <div className="ml-auto">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  All
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience filter */}
        <div className="filter-group">
          <h3 className="font-medium mb-2 flex items-center text-gray-700">
            <Briefcase size={16} className="mr-2 text-blue-500" /> Experience
            (Years)
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={filters.minExperience}
                onChange={(e) =>
                  onFilterChange("minExperience", e.target.value)
                }
                placeholder="Min"
                className="w-full py-2 px-3 border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                min="0"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={filters.maxExperience}
                onChange={(e) =>
                  onFilterChange("maxExperience", e.target.value)
                }
                placeholder="Max"
                className="w-full py-2 px-3 border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Rating filter */}
        <div className="filter-group">
          <h3 className="font-medium mb-2 flex items-center text-gray-700">
            <Star
              size={16}
              className="mr-2 text-yellow-400"
              fill="currentColor"
            />{" "}
            Minimum Rating
          </h3>
          <div className="flex bg-gray-50 rounded-md p-1 border border-gray-100">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all text-sm ${
                  Number(filters.minRating) === rating
                    ? "bg-white text-blue-600 font-medium shadow-sm border border-gray-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => onFilterChange("minRating", rating.toString())}
              >
                {rating}★
              </button>
            ))}
          </div>
        </div>

        {/* Sort by filter */}
        <div className="filter-group">
          <h3 className="font-medium mb-2 text-gray-700">Sort By</h3>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange("sortBy", e.target.value)}
              className="w-full py-2 px-3 border border-gray-200 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm appearance-none"
            >
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="experience-high">Most Experienced</option>
              <option value="experience-low">Least Experienced</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Clear filters button */}
        <button
          onClick={() => {
            onFilterChange("minExperience", "");
            onFilterChange("maxExperience", "");
            onFilterChange("minRating", "");
            onFilterChange("isActive", "");
            onFilterChange("sortBy", "rating-high");
          }}
          className="w-full py-2.5 mt-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          Reset Filters
        </button>
      </div>
    </div>
  );
};

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    name: PropTypes.string,
    specialization: PropTypes.string,
    minExperience: PropTypes.string,
    maxExperience: PropTypes.string,
    minRating: PropTypes.string,
    isActive: PropTypes.string,
    sortBy: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterSidebar;

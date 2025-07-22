import { useNavigate } from "react-router-dom";
import { Star, Briefcase, MapPin, Stethoscope } from "lucide-react";
import PropTypes from "prop-types";

const DoctorCard = ({ doctor = { isActive: true } }) => {
  const navigate = useNavigate();

  const handleDetailClick = (type) => {
    navigate(`/doctor/${doctor._id}`, { 
      state: { highlight: type },
      replace: false 
    });
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star
            key={i}
            size={16}
            className="text-yellow-400"
            fill="currentColor"
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={16} className="text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={16} className="text-yellow-400" fill="currentColor" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="flex flex-col">
        <div className="relative">
          <div className="h-32 w-full bg-gradient-to-r from-blue-100 to-teal-50 flex justify-center items-center">
            <img
              src={doctor.img_url}
              alt={doctor.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleDetailClick('profile')}
            />
          </div>
        </div>

        <div className="p-4">
          <h2 
            className="text-lg font-semibold text-center text-gray-800 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => handleDetailClick('name')}
          >
            {doctor.name}
          </h2>

          <div 
            className="flex justify-center mb-2 cursor-pointer"
            onClick={() => handleDetailClick('specialization')}
          >
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
              <Stethoscope size={14} className="text-blue-600 mr-1" />
              <span className="text-sm text-blue-800">
                {doctor.specialization}
              </span>
            </div>
          </div>

          <div 
            className="flex justify-center items-center space-x-1 mb-3 cursor-pointer"
            onClick={() => handleDetailClick('rating')}
          >
            <div className="flex">{renderStarRating(doctor.Rating)}</div>
            <span className="text-sm font-medium text-gray-700">
              ({doctor.Rating})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div 
              className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
              onClick={() => handleDetailClick('experience')}
            >
              <Briefcase size={14} className="mr-1 text-gray-500" />
              <span>{doctor.experience} years</span>
            </div>
            <div 
              className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
              onClick={() => handleDetailClick('address')}
            >
              <MapPin size={14} className="mr-1 text-gray-500" />
              <span className="truncate">{doctor.address}</span>
            </div>
          </div>

          <button
            onClick={() => handleDetailClick('appointment')}
            className="w-full btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            View Profile & Book
          </button>
        </div>
      </div>
    </div>
  );
};

DoctorCard.propTypes = {
  doctor: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    specialization: PropTypes.string.isRequired,
    experience: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    Rating: PropTypes.number.isRequired,
    img_url: PropTypes.string.isRequired,
    availableSlots: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        slots: PropTypes.arrayOf(PropTypes.string).isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default DoctorCard;

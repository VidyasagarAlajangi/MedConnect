import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminData, fetchAllDoctors, fetchAllPatients } from '../../utils/adminSlice';

const AdminDashboard = () => {
  const adminData = useSelector((state) => state.admin.adminData);
  const doctors = useSelector((state) => state.admin.doctors);
  const patients = useSelector((state) => state.admin.patients);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAdminData());
    dispatch(fetchAllDoctors());
    dispatch(fetchAllPatients());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Admin Info */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Admin Information</h2>
        {adminData && (
          <div className="bg-white p-4 rounded-lg shadow">
            <p>Name: {adminData.name}</p>
            <p>Email: {adminData.email}</p>
          </div>
        )}
      </div>

      {/* Doctors List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Doctors ({doctors.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="text-sm text-gray-500">{doctor.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Patients List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Patients ({patients.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div key={patient._id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-semibold">{patient.name}</p>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
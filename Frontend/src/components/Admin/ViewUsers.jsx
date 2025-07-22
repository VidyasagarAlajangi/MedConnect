import  { useEffect, useState } from "react";
import axios from "axios";
import { Users } from "lucide-react";

export default function ViewUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/view-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-700 mb-6 flex items-center gap-2">
        <Users className="w-7 h-7" /> Users
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl shadow p-6 flex flex-col gap-2 hover:shadow-lg transition"
          >
            <div className="font-semibold text-lg text-orange-800">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                ${user.role === "admin"
                  ? "bg-indigo-100 text-indigo-700"
                  : user.role === "doctor"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"}
              `}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
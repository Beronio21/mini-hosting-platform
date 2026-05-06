"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiCall } from "@/lib/api";

interface Service {
  id: number;
  name: string;
  type: string;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await apiCall(`/api/admin/users/${userId}`);
      setUser(response.user);
      setServices(response.services);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async () => {
    try {
      await apiCall(`/api/admin/users/${userId}/suspend`, { method: "POST" });
      fetchUserDetails();
    } catch (err: any) {
      setError(err.message || "Failed to suspend user");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <a href="/admin/users" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Users
        </a>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg text-gray-900">{user.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Role</label>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              user.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : user.role === 'suspended'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {user.role}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        {user.role !== 'suspended' && (
          <button
            onClick={suspendUser}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Suspend User
          </button>
        )}
      </div>

      {/* Services Table */}
      <h2 className="text-xl font-bold mb-4">User Services</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    service.type === 'n8n' ? 'bg-blue-100 text-blue-800' : 
                    service.type === 'bot' ? 'bg-green-100 text-green-800' : 
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {service.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    service.status === 'running' ? 'bg-green-100 text-green-800' : 
                    service.status === 'stopped' ? 'bg-gray-100 text-gray-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {service.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(service.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500">No services found for this user</div>
        )}
      </div>
    </div>
  );
}

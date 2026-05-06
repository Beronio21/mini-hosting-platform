"use client";

import { useState, useEffect } from "react";
import { apiCall } from "../../../../lib/api";

interface ServiceType {
  type: string;
  count: number;
}

interface Metrics {
  totalUsers: number;
  totalServices: number;
  runningServices: number;
  servicesByType: ServiceType[];
}

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await apiCall("/api/admin/metrics");
      setMetrics(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!metrics) return <div className="p-6">No metrics available</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Metrics</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">
            {metrics.totalUsers}
          </p>
          <p className="text-sm text-gray-500 mt-1">Registered users</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Services</h2>
          <p className="text-3xl font-bold text-green-600">
            {metrics.totalServices}
          </p>
          <p className="text-sm text-gray-500 mt-1">All services created</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Running Services</h2>
          <p className="text-3xl font-bold text-purple-600">
            {metrics.runningServices}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {metrics.totalServices > 0 
              ? `${((metrics.runningServices / metrics.totalServices) * 100).toFixed(1)}% uptime`
              : 'No services yet'
            }
          </p>
        </div>
      </div>

      {/* Services by Type */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Services by Type</h2>
        </div>
        <div className="p-6">
          {metrics.servicesByType.length > 0 ? (
            <div className="space-y-4">
              {metrics.servicesByType.map((service) => (
                <div key={service.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      service.type === 'n8n' ? 'bg-blue-500' :
                      service.type === 'bot' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {service.type}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {service.count} services
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          service.type === 'n8n' ? 'bg-blue-500' :
                          service.type === 'bot' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}
                        style={{ 
                          width: `${metrics.totalServices > 0 ? (service.count / metrics.totalServices) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No services created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

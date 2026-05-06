"use client";

import { useState, useEffect } from "react";
import { apiCall } from "../../../../lib/api";

interface MonthlyEarnings {
  month: string;
  earnings: number;
  payments: number;
}

export default function AdminEarningsPage() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await apiCall("/api/admin/earnings");
      setTotalEarnings(response.totalEarnings);
      setMonthlyEarnings(response.monthlyEarnings);
    } catch (err: any) {
      setError(err.message || "Failed to fetch earnings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Earnings</h1>
      
      {/* Total Earnings Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Earnings</h2>
        <p className="text-3xl font-bold text-green-600">
          ${totalEarnings.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-1">All time revenue</p>
      </div>

      {/* Monthly Earnings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Earnings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average per Payment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyEarnings.map((month) => (
              <tr key={month.month}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${month.earnings.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.payments}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${month.payments > 0 ? (month.earnings / month.payments).toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {monthlyEarnings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No earnings data available yet
          </div>
        )}
      </div>
    </div>
  );
}

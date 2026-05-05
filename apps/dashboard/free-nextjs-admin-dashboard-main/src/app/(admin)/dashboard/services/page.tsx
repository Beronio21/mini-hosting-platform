'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';

type Service = {
  id: number;
  name: string;
  type: 'n8n' | 'bot' | 'api';
  port: number | null;
  subdomain: string | null;
  status: 'running' | 'stopped' | 'error';
  created_at: string;
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadServices() {
    setError('');
    setRefreshing(true);

    try {
      const result = await apiCall<{ services: Service[] }>('/api/services');
      setServices(result.services);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load services';
      setError(message);
      if (message.includes('token')) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  async function runAction(id: number, action: 'start' | 'stop' | 'delete') {
    const confirmed = action === 'delete' ? window.confirm('Delete this service?') : true;
    if (!confirmed) {
      return;
    }

    try {
      await apiCall(`/api/services/${id}${action === 'delete' ? '' : `/${action}`}`, {
        method: action === 'delete' ? 'DELETE' : 'POST',
      });
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Services</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">Your deployments</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Launch, stop, and remove Docker-backed services from one place.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadServices()}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-300"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link
              href="/dashboard/services/new"
              className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Create New Service
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="p-8 text-sm text-gray-500 dark:text-gray-400">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">No services yet</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Create your first service to get a public subdomain.
            </p>
            <Link
              href="/dashboard/services/new"
              className="mt-5 inline-flex rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Create service
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-950/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Subdomain / URL</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/services/${service.id}`} className="font-semibold text-gray-900 hover:text-brand-500 dark:text-white">
                        {service.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-gray-600 dark:text-gray-300">{service.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          service.status === 'running'
                            ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300'
                            : service.status === 'stopped'
                              ? 'bg-warning-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium text-gray-900 dark:text-white">{service.subdomain ? `${service.subdomain}.yourdomain.com` : '—'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Port {service.port ?? '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(service.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void runAction(service.id, service.status === 'running' ? 'stop' : 'start')}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-300"
                        >
                          {service.status === 'running' ? 'Stop' : 'Start'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void runAction(service.id, 'delete')}
                          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

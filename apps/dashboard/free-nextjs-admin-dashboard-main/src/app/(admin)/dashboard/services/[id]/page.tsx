'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadService() {
    setError('');

    try {
      const result = await apiCall<{ service: Service }>(`/api/services/${id}`);
      setService(result.service);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load service';
      setError(message);
      if (message.includes('token')) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      void loadService();
    }
  }, [id]);

  async function runAction(action: 'start' | 'stop' | 'delete') {
    const confirmed = action === 'delete' ? window.confirm('Delete this service?') : true;
    if (!confirmed) {
      return;
    }

    try {
      await apiCall(`/api/services/${id}${action === 'delete' ? '' : `/${action}`}`, {
        method: action === 'delete' ? 'DELETE' : 'POST',
      });
      if (action === 'delete') {
        router.replace('/dashboard/services');
        return;
      }
      await loadService();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Service details</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">Deployment view</h1>
        </div>
        <Link
          href="/dashboard/services"
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-300"
        >
          Back to services
        </Link>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading service...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : service ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="Name" value={service.name} />
              <InfoCard label="Type" value={service.type} />
              <InfoCard label="Status" value={service.status} />
              <InfoCard label="Port" value={service.port?.toString() ?? '—'} />
              <InfoCard label="Subdomain" value={service.subdomain ?? '—'} />
              <InfoCard label="URL" value={service.subdomain ? `https://${service.subdomain}.yourdomain.com` : '—'} />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void runAction(service.status === 'running' ? 'stop' : 'start')}
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                {service.status === 'running' ? 'Stop service' : 'Start service'}
              </button>
              <button
                type="button"
                onClick={() => void runAction('delete')}
                className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                Delete service
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiCall } from '@/lib/api';

export default function NewServicePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<'n8n' | 'bot' | 'api'>('n8n');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiCall('/api/services', {
        method: 'POST',
        body: JSON.stringify({ name, type, subdomain }),
      });
      router.replace('/dashboard/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Create service</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">New deployment</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Pick a template, set a subdomain, and let the backend provision the container.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Service name</span>
          <input
            className="w-full rounded-2xl border border-gray-200 bg-transparent px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="My n8n instance"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Type</span>
          <select
            className="w-full rounded-2xl border border-gray-200 bg-transparent px-4 py-3 text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:text-white"
            value={type}
            onChange={(event) => setType(event.target.value as 'n8n' | 'bot' | 'api')}
          >
            <option value="n8n">n8n</option>
            <option value="bot">bot</option>
            <option value="api">api</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Subdomain</span>
          <input
            className="w-full rounded-2xl border border-gray-200 bg-transparent px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white"
            value={subdomain}
            onChange={(event) => setSubdomain(event.target.value)}
            placeholder="my-n8n"
            pattern="[a-z0-9-]+"
            minLength={3}
            maxLength={30}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Use lowercase letters, numbers, and hyphens only.</p>
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create service'}
          </button>
          <Link
            href="/dashboard/services"
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

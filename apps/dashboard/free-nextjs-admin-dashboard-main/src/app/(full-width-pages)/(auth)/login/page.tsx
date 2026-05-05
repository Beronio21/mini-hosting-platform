'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';

type LoginResponse = {
  token: string;
  userId: number;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.replace('/dashboard/services');
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', result.token);
      router.replace('/dashboard/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(70,95,255,0.22),_transparent_36%),linear-gradient(180deg,_#081018_0%,_#0d1320_50%,_#111827_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between bg-[#0b1220] p-10 md:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Mini Hosting Platform</p>
              <h1 className="mt-6 max-w-md text-5xl font-semibold leading-tight text-white">
                Sign in to manage your containers and subdomains.
              </h1>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <p>• Launch n8n, bot, and API services from one dashboard.</p>
              <p>• Start, stop, and delete workloads with a few clicks.</p>
              <p>• Keep everything behind JWT authentication and Caddy proxying.</p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Login</h2>
              <p className="mt-2 text-sm text-slate-300">Use the email and password tied to your hosting account.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Email</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Password</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-blue-500 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-300">
              Need an account?{' '}
              <Link className="font-semibold text-blue-300 hover:text-blue-200" href="/register">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

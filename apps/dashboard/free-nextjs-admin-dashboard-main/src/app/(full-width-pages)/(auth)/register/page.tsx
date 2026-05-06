'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type RegisterResponse = {
  token: string;
  userId: number;
  role: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard/services');
    }
  }, [user, isLoading, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data: RegisterResponse = await response.json();
        // Auto-login after successful registration
        const loginSuccess = await login(email, password);
        if (loginSuccess) {
          router.replace('/dashboard/services');
        } else {
          setError('Registration successful but login failed. Please try logging in.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,101,20,0.2),_transparent_34%),linear-gradient(180deg,_#081018_0%,_#111827_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:grid-cols-[0.9fr_1.1fr]">
          <div className="order-2 p-6 sm:p-10 md:order-1">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Create account</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Register</h2>
              <p className="mt-2 text-sm text-slate-300">Get access to your deployment dashboard in a few steps.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Email</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-orange-400"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-orange-400"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Confirm password</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-orange-400"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
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
                className="flex w-full items-center justify-center rounded-2xl bg-orange-500 px-4 py-3.5 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-300">
              Already have an account?{' '}
              <Link className="font-semibold text-orange-300 hover:text-orange-200" href="/login">
                Sign in
              </Link>
            </p>
          </div>

          <div className="order-1 hidden flex-col justify-between bg-[#0b1220] p-10 md:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Mini Hosting Platform</p>
              <h1 className="mt-6 max-w-md text-5xl font-semibold leading-tight text-white">
                Create an account and start shipping services faster.
              </h1>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <p>• Manage service types, ports, and subdomains from one panel.</p>
              <p>• Keep your infrastructure behind JWT auth and an API gateway.</p>
              <p>• Scale the dashboard UI later without changing the backend shape.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

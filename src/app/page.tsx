'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsError(true);
        setMsg(error.message);
        setIsLoading(false);
        return;
      }
      router.push('/dashboard');
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setIsError(true);
        setMsg(error.message);
        setIsLoading(false);
        return;
      }
      if (data.session) {
        router.push('/dashboard');
        return;
      }
      setIsError(false);
      setMsg('Account created! Please check your email to confirm before signing in.');
      setMode('signin');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <div className="inline-flex items-center gap-3 mb-6 animate-slide-in-up">
           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <FileText className="h-6 w-6 text-white" />
           </div>
           <h1 className="text-4xl font-black text-glow bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 uppercase tracking-tighter">
             AriseOS
           </h1>
        </div>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white">
          {mode === 'signin' ? 'Sign in to Invoice Manager' : 'Create an AriseOS account'}
        </h2>
        <p className="mt-2 text-sm text-navy-400">
           Manage your business infrastructure in one place.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm glass-card p-8 animate-fade-in">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-navy-200">
              Email address
            </label>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-navy-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-navy-200">
              Password
            </label>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-navy-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign in' : 'Get Started'}
            </button>
          </div>
        </form>

        {msg && (
          <div className={`mt-4 text-center text-sm font-medium ${isError ? 'text-red-400' : 'text-green-400'}`}>
            {msg}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-navy-300">
          {mode === 'signin' ? (
            <>
              New to AriseOS?{' '}
              <button
                onClick={() => { setMode('signup'); setMsg(''); }}
                className="font-semibold text-cyan-400 hover:text-cyan-300 bg-transparent border-none p-0 cursor-pointer"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setMsg(''); }}
                className="font-semibold text-cyan-400 hover:text-cyan-300 bg-transparent border-none p-0 cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

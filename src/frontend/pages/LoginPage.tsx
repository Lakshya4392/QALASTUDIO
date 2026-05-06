import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import SEO from '../components/SEO';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to redirect after login (default: profile)
  const from = (location.state as any)?.from || '/profile';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } else {
      if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
      if (!phone.trim()) { setError('Phone number is required'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
      const res = await register(fullName, email, phone, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Registration failed');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <SEO title={mode === 'login' ? 'Login - Qala Studios' : 'Register - Qala Studios'} description="Sign in or create an account to book your studio session." />
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-['Oswald'] font-bold uppercase tracking-tight mb-2">
              {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h1>
            <p className="text-neutral-500 text-sm">
              {mode === 'login' ? 'Welcome back to Qala Studios' : 'Join Qala Studios to start booking'}
            </p>
          </div>

          <div className="bg-white border-4 border-black p-10 shadow-lg">
            {/* Mode Toggle */}
            <div className="flex mb-8 border-2 border-black">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-50'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-50'}`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-neutral-900 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-neutral-500 mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="font-bold text-black underline hover:no-underline"
              >
                {mode === 'login' ? 'Register here' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

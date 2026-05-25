import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { loginApi } from '../api/auth';
import { EMAIL_PATTERN, isValidEmail } from '../utils/validation';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = form.email.trim();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const data = await loginApi({ ...form, email });
      login(data.business, data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 sidebar-bg p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute -top-20 -left-10 w-3/4 h-3/4 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="font-display text-white text-2xl font-bold">ReviewNest</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
            Your private review<br />
            <span className="text-blue-400">request dashboard.</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-10 w-11/12">
            Send WhatsApp review requests, guide happy customers to Google, and capture private feedback.
          </p>
        </div>

        <p className="text-slate-500 text-sm font-medium relative z-10">(c) 2026 ReviewNest</p>
      </div>

      <div className="flex-1 flex items-center justify-center w-1/2 px-6 py-12 lg:px-12 bg-white">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Zap size={17} className="text-white" />
            </div>
            <span className="font-display text-slate-900 text-xl font-bold">ReviewNest</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mb-8 text-sm">Sign in to your business dashboard</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                required
                pattern={EMAIL_PATTERN}
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@business.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="********"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 transition-all pr-12 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full card-blue text-white font-bold py-4 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-60 disabled:hover:-translate-y-0"
            >
              {isLoading ? 'Signing in...' : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">Sign in with the owner account created during setup.</p>
        </div>
      </div>
    </div>
  );
}

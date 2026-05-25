import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Check, Eye, EyeOff, Link as LinkIcon, Phone, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { registerApi } from '../api/auth';
import { BUSINESS_TYPES } from '../data/businessTemplates';
import { EMAIL_PATTERN, isValidEmail } from '../utils/validation';
import { GOOGLE_REVIEW_LINK_ERROR, GOOGLE_REVIEW_LINK_PLACEHOLDER, isValidReviewLink } from '../utils/googleReviewLink';

const checkPassword = (password: string) => ({
  minLength: password.length >= 8,
  hasUpper: /[A-Z]/.test(password),
  hasLower: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSymbol: /[@$!%*?&]/.test(password),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    businessType: '',
    phone: '',
    googleReviewUrl: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = checkPassword(form.password);
  const isPasswordValid = Object.values(strength).every(Boolean);
  const isReviewLinkValid = isValidReviewLink(form.googleReviewUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = form.email.trim();
    const phone = form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!BUSINESS_TYPES.includes(form.businessType)) return setError('Please select a business type from the list.');
    if (phone.length !== 10) return setError('Please enter a valid 10-digit WhatsApp number.');
    if (!isReviewLinkValid) return setError(GOOGLE_REVIEW_LINK_ERROR);
    if (!isPasswordValid) return setError('Please meet all password requirements.');

    setError('');
    setIsLoading(true);
    try {
      const data = await registerApi({ ...form, email, phone, googleReviewUrl: form.googleReviewUrl.trim() });
      login(data.business, data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none';
  const labelClass = 'flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-[520px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/70 p-6 sm:p-8">
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">R</div>
            <span className="font-display text-slate-900 text-2xl font-bold">ReviewNest</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-950 tracking-tight">Set up your business</h1>
          <p className="text-slate-500 mt-2 text-sm">Create the single owner account for this ReviewNest installation.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className={labelClass}><Building2 size={15} /> Business name</label>
            <input required className={inputClass} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="e.g. Sharma Dental Clinic" />
          </div>

          <div>
            <label className={labelClass}><User size={15} /> Owner name</label>
            <input required className={inputClass} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="e.g. Anil Sharma" />
          </div>

          <div>
            <label className={labelClass}><Building2 size={15} /> Business type</label>
            <select required className={inputClass} value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}>
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}><Phone size={15} /> WhatsApp number</label>
            <input required type="tel" inputMode="numeric" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile number" />
          </div>

          <div>
            <label className={labelClass}><LinkIcon size={15} /> Google review link</label>
            <input required type="url" className={inputClass} value={form.googleReviewUrl} onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })} placeholder={GOOGLE_REVIEW_LINK_PLACEHOLDER} />
            {form.googleReviewUrl && (
              <p className={`text-xs font-bold mt-2 ${isReviewLinkValid ? 'text-green-700' : 'text-red-600'}`}>
                {isReviewLinkValid ? 'Review link looks good.' : GOOGLE_REVIEW_LINK_ERROR}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Sign-in email</label>
            <input required type="email" pattern={EMAIL_PATTERN} className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="owner@business.com" />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input required type={showPassword ? 'text' : 'password'} className={`${inputClass} pr-12`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a strong password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-3 grid gap-1.5">
                {[
                  ['minLength', 'At least 8 characters'],
                  ['hasUpper', 'Uppercase letter'],
                  ['hasLower', 'Lowercase letter'],
                  ['hasNumber', 'Number'],
                  ['hasSymbol', 'Symbol (@$!%*?&)'],
                ].map(([key, label]) => {
                  const passed = strength[key as keyof typeof strength];
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-500' : 'bg-slate-200'}`}>
                        {passed && <Check size={10} className="text-white" />}
                      </span>
                      <span className={`text-xs font-medium ${passed ? 'text-green-700' : 'text-slate-400'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2">
            {isLoading ? 'Saving setup...' : <><span>Complete setup</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already set up? <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

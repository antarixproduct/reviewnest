import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2, KeyRound, Link as LinkIcon, Mail, Save, Star } from 'lucide-react';
import api from '../api/client';
import { changePasswordApi } from '../api/auth';
import { BUSINESS_TYPES, DEFAULT_MESSAGE_TEMPLATE, getMessageTemplateForBusinessType } from '../data/businessTemplates';
import { GOOGLE_REVIEW_LINK_ERROR, GOOGLE_REVIEW_LINK_PLACEHOLDER, isValidReviewLink } from '../utils/googleReviewLink';

const getErrorMessage = (err: unknown, fallback: string) => (
  err && typeof err === 'object' && 'response' in err
    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
    : err instanceof Error
      ? err.message
      : fallback
);

export default function SettingsPage() {
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    businessType: '',
    phone: '',
    googleReviewUrl: '',
    msgTemplate: DEFAULT_MESSAGE_TEMPLATE,
    starThreshold: 4,
    emailAutomationEnabled: false,
    smtpUser: '',
    smtpPass: '',
    emailFromAddress: '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useQuery({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const res = await api.get('/business/profile');
      const b = res.data.business;
      setForm({
        businessName: b.businessName || '',
        ownerName: b.ownerName || '',
        businessType: b.businessType || '',
        phone: b.phone || '',
        googleReviewUrl: b.googleReviewUrl || '',
        msgTemplate: b.msgTemplate || DEFAULT_MESSAGE_TEMPLATE,
        starThreshold: b.starThreshold || 4,
        emailAutomationEnabled: Boolean(b.emailAutomationEnabled),
        smtpUser: b.smtpUser || '',
        smtpPass: '',
        emailFromAddress: b.emailFromAddress || b.smtpUser || '',
      });
      return b;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/business/profile', { ...form, googleReviewUrl: form.googleReviewUrl.trim() });
      return res.data;
    },
    onSuccess: () => {
      setSuccess('Settings saved successfully');
      setError('');
      setForm((current) => ({ ...current, smtpPass: '' }));
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: unknown) => setError(getErrorMessage(err, 'Failed to save settings')),
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/business/test-email', {
        to: form.smtpUser,
        smtpUser: form.smtpUser,
        smtpPass: form.smtpPass,
        emailFromAddress: form.emailFromAddress,
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess('Test email sent successfully');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: unknown) => setError(getErrorMessage(err, 'Failed to send test email')),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePasswordApi(passwordForm),
    onSuccess: () => {
      setSuccess('Password changed successfully');
      setError('');
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: unknown) => setError(getErrorMessage(err, 'Failed to change password')),
  });

  const handleSave = () => {
    if (!form.businessName.trim()) return setError('Business name is required');
    if (!form.ownerName.trim()) return setError('Owner name is required');
    if (!BUSINESS_TYPES.includes(form.businessType)) return setError('Please select a listed business type');
    if (!isValidReviewLink(form.googleReviewUrl)) return setError(GOOGLE_REVIEW_LINK_ERROR);
    if (form.emailAutomationEnabled && !form.smtpUser.trim()) {
      return setError('Enter a Gmail address before enabling email automation');
    }
    updateMutation.mutate();
  };

  const sectionStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    marginBottom: '16px',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: '#f8fafc',
    color: '#0f172a',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '8px',
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>Settings</h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>Manage this ReviewNest installation</p>
      </div>

      {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '14px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontWeight: 700 }}>{success}</div>}
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontWeight: 700 }}>{error}</div>}

      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#2563eb" /> Business Profile
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Business name</label>
            <input style={inputStyle} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Owner name</label>
            <input style={inputStyle} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Business type</label>
            <select
              style={inputStyle}
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value, msgTemplate: getMessageTemplateForBusinessType(e.target.value) })}
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>WhatsApp number</label>
            <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
          </div>
          <div>
            <label style={labelStyle}>Google review link</label>
            <input style={{ ...inputStyle, borderColor: isValidReviewLink(form.googleReviewUrl) ? '#86efac' : '#fecaca' }} value={form.googleReviewUrl} onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })} placeholder={GOOGLE_REVIEW_LINK_PLACEHOLDER} />
            <button type="button" disabled={!isValidReviewLink(form.googleReviewUrl)} onClick={() => window.open(form.googleReviewUrl.trim(), '_blank')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', border: 'none', background: isValidReviewLink(form.googleReviewUrl) ? '#2563eb' : '#93c5fd', color: 'white', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', fontWeight: 800, cursor: isValidReviewLink(form.googleReviewUrl) ? 'pointer' : 'not-allowed' }}>
              Test Link <LinkIcon size={13} />
            </button>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={18} color="#2563eb" /> Review Gateway
        </h2>
        <label style={labelStyle}>Send customers to Google review page when rating is</label>
        <select style={inputStyle} value={form.starThreshold} onChange={(e) => setForm({ ...form, starThreshold: Number(e.target.value) })}>
          <option value={4}>4 stars or above</option>
          <option value={5}>5 stars only</option>
        </select>
        <label style={{ ...labelStyle, marginTop: '16px' }}>Message template</label>
        <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={form.msgTemplate} onChange={(e) => setForm({ ...form, msgTemplate: e.target.value })} />
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={18} color="#2563eb" /> Email Automation
        </h2>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <span>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Enable automatic review emails</span>
            <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Customers with email addresses receive a review request automatically when added.</span>
          </span>
          <input type="checkbox" checked={form.emailAutomationEnabled} onChange={(e) => setForm({ ...form, emailAutomationEnabled: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
        </label>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Gmail address</label>
            <input type="email" style={inputStyle} value={form.smtpUser} onChange={(e) => setForm({ ...form, smtpUser: e.target.value, emailFromAddress: form.emailFromAddress || e.target.value })} placeholder="business@gmail.com" />
          </div>
          <div>
            <label style={labelStyle}>Gmail app password</label>
            <input type="password" style={inputStyle} value={form.smtpPass} onChange={(e) => setForm({ ...form, smtpPass: e.target.value })} placeholder="Leave blank to keep saved password" />
          </div>
          <div>
            <label style={labelStyle}>From address</label>
            <input type="email" style={inputStyle} value={form.emailFromAddress} onChange={(e) => setForm({ ...form, emailFromAddress: e.target.value })} placeholder="business@gmail.com" />
          </div>
          <button type="button" onClick={() => testEmailMutation.mutate()} disabled={testEmailMutation.isPending || !form.smtpUser} style={{ justifySelf: 'start', border: 'none', background: '#0f172a', color: 'white', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', opacity: testEmailMutation.isPending ? 0.7 : 1 }}>
            {testEmailMutation.isPending ? 'Sending...' : 'Test Email'}
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={updateMutation.isPending} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#2563eb', color: 'white', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', opacity: updateMutation.isPending ? 0.7 : 1, marginBottom: '16px' }}>
        <Save size={17} /> {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
      </button>

      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={18} color="#2563eb" /> Account
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Current password</label>
            <input type="password" style={inputStyle} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>New password</label>
            <input type="password" style={inputStyle} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          </div>
          <button type="button" onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending || !passwordForm.currentPassword || !passwordForm.newPassword} style={{ justifySelf: 'start', border: 'none', background: '#0f172a', color: 'white', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', opacity: passwordMutation.isPending ? 0.7 : 1 }}>
            {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

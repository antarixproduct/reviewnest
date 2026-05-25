import { useQuery } from '@tanstack/react-query';
import { Star, Users, MousePointerClick, MessageSquare, Clock, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { getAnalyticsApi } from '../api/analytics';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { business } = useAuthStore();

  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: getAnalyticsApi });

  const totalRequests = analytics?.totalRequests || 0;
  const totalClicks = analytics?.clickedRequests || 0;
  const clickRate = totalRequests > 0 ? Math.round((totalClicks / totalRequests) * 100) : 0;
  const googleRedirects = analytics?.googleRedirects || 0;
  const negativeFeedback = analytics?.feedbackReceived || 0;
  const pendingRequests = analytics?.pendingRequests || 0;
  const recentRequests = analytics?.recentRequests || [];
  const growth = analytics?.growth;
  const maxWeeklyRequests = Math.max(1, ...(growth?.weeklyVolume || []).map((week) => week.requests || 0));

  const stats = [
    { label: 'Total Requests', value: totalRequests, icon: Zap, gradient: 'card-blue', sub: 'All time' },
    { label: 'Link Clicks', value: totalClicks, icon: MousePointerClick, gradient: 'card-green', sub: 'Customers clicked' },
    { label: 'Click Rate', value: `${clickRate}%`, icon: TrendingUp, gradient: 'card-purple', sub: 'Engagement rate' },
    { label: 'Google Redirects', value: googleRedirects, icon: Star, gradient: 'card-orange', sub: 'Sent to Google' },
    { label: 'Feedback Received', value: negativeFeedback, icon: MessageSquare, gradient: 'card-red', sub: 'Private feedback' },
    { label: 'Pending', value: pendingRequests, icon: Clock, gradient: 'card-teal', sub: 'Not clicked yet' },
  ];

  return (
    <>
      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>Dashboard</h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
              {business?.businessName} - {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 800, marginBottom: '10px' }}>Review Gateway</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={26} color="#f59e0b" fill="#f59e0b" />
              <p style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', fontFamily: 'Syne, sans-serif' }}>{googleRedirects}</p>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 700 }}>sent to Google</p>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>Google score syncing is not used in ReviewNest.</p>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 800, marginBottom: '10px' }}>Growth Summary</p>
            <p style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700, lineHeight: 1.6 }}>{growth?.weeklySummary || 'Send more requests to build your weekly summary.'}</p>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map(({ label, value, icon: Icon, gradient, sub }) => (
            <div key={label} className={gradient} style={{ borderRadius: '16px', padding: '18px', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Icon size={16} color="white" />
                </div>
                <p style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Syne, sans-serif', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>{label}</p>
                <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {growth?.weeklyVolume && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '16px' }}>Review Volume Growth</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '150px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              {growth.weeklyVolume.map((week) => (
                <div key={week.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div title={`${week.requests} requests`} style={{ width: '100%', maxWidth: '28px', height: `${Math.max(6, (week.requests / maxWeeklyRequests) * 120)}px`, background: '#2563eb', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>{week.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
              {growth.table?.map((row) => (
                <div key={row.period} style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(4, 1fr)', gap: '8px', fontSize: '12px', color: '#475569', alignItems: 'center' }}>
                  <strong style={{ color: '#0f172a' }}>{row.period}</strong>
                  <span>{row.requests} sent</span>
                  <span>{row.clicks} clicks</span>
                  <span>{row.positiveRatings} positive</span>
                  <span style={{ color: row.growth === null ? '#94a3b8' : row.growth >= 0 ? '#047857' : '#dc2626', fontWeight: 800 }}>{row.growth === null ? '-' : `${row.growth >= 0 ? '+' : '-'}${Math.abs(row.growth)}%`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Recent Requests</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Last 5</span>
          </div>

          {recentRequests.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Star size={22} color="#3b82f6" />
              </div>
              <p style={{ color: '#475569', fontWeight: 600, fontSize: '14px' }}>No requests yet</p>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Go to Customers to send your first review request</p>
            </div>
          ) : (
            <div>
              {recentRequests.map((req) => (
                <div key={req._id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={15} color="#64748b" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.customerId?.name || 'Unknown'}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(req.sentAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                      background: req.outcome === 'google' ? '#dcfce7' : req.outcome === 'feedback' ? '#fee2e2' : req.clickedAt ? '#dbeafe' : '#ffedd5',
                      color: req.outcome === 'google' ? '#15803d' : req.outcome === 'feedback' ? '#dc2626' : req.clickedAt ? '#1d4ed8' : '#c2410c',
                    }}>
                      {req.outcome === 'google' ? 'Google' : req.outcome === 'feedback' ? 'Feedback' : req.clickedAt ? 'Clicked' : 'Pending'}
                    </span>
                    <ArrowUpRight size={14} color="#cbd5e1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

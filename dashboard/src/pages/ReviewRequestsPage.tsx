import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, MousePointerClick, Clock, Star, CheckCircle, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getReviewRequestsApi, resendReviewRequestApi } from '../api/reviews';

function getHoursAgo(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
}

function getCountdown(dateStr: string) {
  const hoursLeft = 24 - getHoursAgo(dateStr);
  if (hoursLeft <= 0) return null;
  if (hoursLeft < 1) return `${Math.ceil(hoursLeft * 60)}m`;
  return `${Math.ceil(hoursLeft)}h`;
}

export default function ReviewRequestsPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset page on search change
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page on status filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['requests', page, searchQuery, statusFilter],
    queryFn: () => getReviewRequestsApi({ page, limit: 10, search: searchQuery, status: statusFilter }),
  });

  const requests = requestsData?.requests || [];
  const totalRequests = requestsData?.total || 0;
  const totalPages = requestsData?.totalPages || 1;

  const resendMutation = useMutation({
    mutationFn: async (id: string) => {
      const data = await resendReviewRequestApi(id);
      window.open(data.whatsappUrl, '_blank');
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to resend'),
  });

  const getStatusBadge = (req: any) => {
    if (req.outcome === 'google')   return { label: 'Google', bg: '#dcfce7', color: '#15803d' };
    if (req.outcome === 'feedback') return { label: 'Feedback', bg: '#fee2e2', color: '#dc2626' };
    if (req.clickedAt)              return { label: 'Clicked',  bg: '#dbeafe', color: '#1d4ed8' };
    if (req.needsResend)            return { label: 'Follow up', bg: '#fef9c3', color: '#a16207' };
    return { label: 'Pending', bg: '#ffedd5', color: '#c2410c' };
  };

  const stats = [
    { label: 'Total Sent',  value: totalRequests,                                            color: '#64748b' },
    { label: 'Clicked',     value: requests.filter((r) => r.clickedAt).length,               color: '#2563eb' },
    { label: 'To Google',   value: requests.filter((r) => r.outcome === 'google').length,    color: '#16a34a' },
    { label: 'Follow Up',   value: requests.filter((r) => r.needsResend).length,             color: '#a16207' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>Review Requests</h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>{totalRequests} total requests matched</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1 1 300px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '300px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', background: 'white' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={14} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px 14px 10px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', background: 'white', color: '#0f172a', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="clicked">Clicked</option>
              <option value="google">Sent to Google</option>
              <option value="feedback">Feedback Received</option>
              <option value="followup">Needs Follow Up</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {stats.map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color }}>{value}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>Loading...</div>
      ) : requests.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Star size={24} color="#94a3b8" />
          </div>
          <p style={{ color: '#475569', fontWeight: 600, fontSize: '15px' }}>No requests sent yet</p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Go to Customers to send your first review request</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {requests.map((req) => {
            const badge     = getStatusBadge(req);
            const hoursAgo  = getHoursAgo(req.sentAt);
            const isResolved = req.clickedAt || req.outcome !== 'pending';

            // Resend is eligible if: not resolved AND (server flagged needsResend OR 24h have passed client-side)
            const canResend  = !isResolved && (req.needsResend || hoursAgo >= 24);
            const countdown  = !isResolved && !canResend ? getCountdown(req.sentAt) : null;
            const isPending  = resendMutation.isPending;

            return (
              <div key={req._id} style={{ background: 'white', borderRadius: '14px', border: `1px solid ${req.needsResend && !isResolved ? '#fde68a' : '#e2e8f0'}`, padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>

                  {/* Left: info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                        {req.customerId?.name || 'Unknown'}
                      </p>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                      {req.resendCount > 0 && (
                        <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>
                          Resent {req.resendCount}x
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>+91 {req.customerId?.phone}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                        <Clock size={11} /> Sent {new Date(req.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      {req.clickedAt && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3b82f6' }}>
                          <MousePointerClick size={11} /> Clicked {new Date(req.clickedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {req.starRating && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b' }}>
                          <Star size={11} /> {req.starRating} stars
                        </span>
                      )}
                      {req.outcome === 'google' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16a34a' }}>
                          <CheckCircle size={11} /> Sent to Google
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: resend control */}
                  {!isResolved && (
                    canResend ? (
                      /* ── Active resend button ── */
                      <button
                        onClick={() => resendMutation.mutate(req._id)}
                        disabled={isPending}
                        title="Send WhatsApp reminder"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '9px 16px', borderRadius: '10px', flexShrink: 0,
                          border: '1.5px solid #2563eb', background: '#eff6ff',
                          fontSize: '13px', fontWeight: 700, color: '#2563eb',
                          cursor: isPending ? 'not-allowed' : 'pointer',
                          opacity: isPending ? 0.6 : 1, whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                      >
                        <RotateCcw size={13} />
                        {isPending ? 'Opening...' : 'Resend'}
                      </button>
                    ) : (
                      /* ── Disabled with countdown ── */
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                        padding: '8px 12px', borderRadius: '10px', flexShrink: 0,
                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                          <RotateCcw size={12} /> Resend
                        </span>
                        <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500 }}>
                          in {countdown}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Page {page} of {totalPages}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={18} color="#475569" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={18} color="#475569" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


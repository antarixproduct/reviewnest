import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Star, Phone, CheckCircle } from 'lucide-react';
import { getFeedbackApi, updateFeedbackStatusApi } from '../api/feedback';
import type { Feedback } from '../api/feedback';

const tabs = ['all', 'new', 'seen', 'resolved'];

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ['feedback'],
    queryFn: () => getFeedbackApi(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateFeedbackStatusApi(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedback'] }),
  });

  const filtered = activeTab === 'all' ? feedbacks : feedbacks.filter((f) => f.status === activeTab);
  const newCount = feedbacks.filter((f) => f.status === 'new').length;

  const getNextStatus = (status: string) => {
    if (status === 'new') return 'seen';
    if (status === 'seen') return 'resolved';
    return 'new';
  };

  const getNextLabel = (status: string) => {
    if (status === 'new') return 'Mark Seen';
    if (status === 'seen') return 'Resolve';
    return 'Reopen';
  };

  const statusStyle = (status: string) => {
    if (status === 'new') return { bg: '#fee2e2', color: '#dc2626' };
    if (status === 'seen') return { bg: '#fef9c3', color: '#a16207' };
    return { bg: '#dcfce7', color: '#15803d' };
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>Feedback Inbox</h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
          {newCount > 0 ? `${newCount} new feedback` : 'No new feedback'}
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, textTransform: 'capitalize',
              background: activeTab === tab ? '#2563eb' : 'white',
              color: activeTab === tab ? 'white' : '#64748b',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
              border: activeTab === tab ? 'none' : '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {tab}
            {tab === 'new' && newCount > 0 && (
              <span style={{ background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '20px' }}>
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>Loading feedback...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageSquare size={24} color="#94a3b8" />
          </div>
          <p style={{ color: '#475569', fontWeight: 600, fontSize: '15px' }}>No feedback here</p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Private feedback from unhappy customers will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((fb) => {
            const s = statusStyle(fb.status);
            return (
              <div key={fb._id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{fb.customerId?.name || 'Unknown'}</p>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color, textTransform: 'capitalize' }}>
                        {fb.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                        <Phone size={12} /> +91 {fb.customerId?.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} color={i < fb.starRating ? '#f59e0b' : '#e2e8f0'} fill={i < fb.starRating ? '#f59e0b' : '#e2e8f0'} />
                        ))}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(fb.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => statusMutation.mutate({ id: fb._id, status: getNextStatus(fb.status) })}
                    disabled={statusMutation.isPending}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    <CheckCircle size={13} />
                    {getNextLabel(fb.status)}
                  </button>
                </div>

                {/* Feedback message */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', borderLeft: '3px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>"{fb.message}"</p>
                </div>

                {/* Contact permission */}
                {fb.allowContact && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                    <CheckCircle size={14} color="#2563eb" />
                    <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>Customer allowed contact</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Zap } from 'lucide-react';
import api from '../api/client';

type ReviewPageData = {
  businessName: string;
  businessType?: string;
  starThreshold?: number;
  googleReviewUrl?: string;
};

const toTitleCase = (value: string) => {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
};

export default function PublicReviewPage() {
  const { token = '' } = useParams();
  const loadedToken = useRef('');
  const [data, setData] = useState<ReviewPageData | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [allowContact, setAllowContact] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [statusTitle, setStatusTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusIcon, setStatusIcon] = useState('⚡');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setStatusTitle('Invalid link');
      setStatusMessage('This review link is invalid or has expired.');
      return;
    }

    if (loadedToken.current === token) return;
    loadedToken.current = token;

    const loadReviewPage = async () => {
      try {
        const res = await api.get(`/reviews/r/${token}`);
        setData(res.data);
        document.title = `Rate ${toTitleCase(res.data.businessName || 'ReviewNest')}`;
        setStatus('ready');
      } catch (err: any) {
        setStatus('error');
        setStatusTitle('Review link unavailable');
        setStatusMessage(err.response?.data?.message || 'This review link is invalid or has expired.');
      }
    };

    loadReviewPage();
  }, [token]);

  const submitRating = async (rating: number) => {
    if (!token || isSubmitting) return;
    setSelectedRating(rating);
    setIsSubmitting(true);

    try {
      const res = await api.post(`/reviews/r/${token}/rate`, { starRating: rating });
      if (res.data.outcome === 'google') {
        setStatusIcon('🌟');
        setStatusTitle('Thank you so much!');
        setStatusMessage('Redirecting you to Google to leave a review...');
        setStatus('success');
        window.setTimeout(() => {
          window.location.href = res.data.googleReviewUrl || data?.googleReviewUrl || '/';
        }, 2000);
      } else {
        setShowFeedback(true);
      }
    } catch (err: any) {
      setStatus('error');
      setStatusTitle('Something went wrong');
      setStatusMessage(err.response?.data?.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    if (!token || !feedback.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.post('/feedback/submit', {
        token,
        message: feedback.trim(),
        allowContact,
      });

      setStatusIcon('🙏');
      setStatusTitle('Feedback received!');
      setStatusMessage('We sincerely apologize for the inconvenience. Thank you for helping this business improve.');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setStatusTitle('Could not submit feedback');
      setStatusMessage(err.response?.data?.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleRating = hoverRating || selectedRating;
  const businessName = toTitleCase(data?.businessName || '');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_42%,#ffffff_100%)] px-4 py-8 text-slate-950">
      <main className="mx-auto flex min-h-[calc(100vh-96px)] max-w-[480px] flex-col justify-center">
        <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">
          {status === 'loading' && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] bg-blue-600 text-white">
                <Zap size={22} className="fill-white" />
              </div>
              <p className="text-sm font-bold text-blue-700">Loading review page...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-red-50 text-2xl">!</div>
              <h1 className="font-display text-2xl font-bold text-slate-950">{statusTitle || 'Invalid link'}</h1>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{statusMessage}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[8px] bg-emerald-50 text-3xl">{statusIcon}</div>
              <h1 className="font-display text-2xl font-bold text-slate-950">{statusTitle}</h1>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{statusMessage}</p>
            </div>
          )}

          {status === 'ready' && data && (
            <>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[8px] bg-blue-600 font-display text-3xl font-bold text-white">
                  {businessName.charAt(0) || 'R'}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">Quick review</p>
                <h1 className="font-display mt-2 text-3xl font-bold text-slate-950">{businessName}</h1>
                {data.businessType && (
                  <p className="mt-2 text-sm font-semibold text-slate-500">{toTitleCase(data.businessType)}</p>
                )}
                <p className="mx-auto mt-5 max-w-sm text-sm font-medium leading-6 text-slate-600">
                  How was your experience? Your rating helps this business improve and helps other customers choose confidently.
                </p>
              </div>

              <div className="mt-8 flex justify-center gap-2" aria-label="Select a rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => submitRating(rating)}
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={isSubmitting}
                    className={`flex h-12 w-12 items-center justify-center rounded-[8px] border text-3xl transition ${
                      rating <= visibleRating
                        ? 'border-amber-300 bg-amber-50 text-amber-400'
                        : 'border-slate-200 bg-slate-50 text-slate-300 hover:border-amber-200 hover:bg-amber-50'
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                    aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {showFeedback && (
                <div className="mt-7 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                  <h2 className="font-display text-lg font-bold text-slate-950">Tell us what went wrong</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    Your feedback goes privately to the business so they can improve.
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Share your feedback..."
                    className="mt-4 min-h-28 w-full resize-none rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  <label className="mt-3 flex items-start gap-2 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={allowContact}
                      onChange={(event) => setAllowContact(event.target.checked)}
                      className="mt-1"
                    />
                    This business may contact me to resolve this issue.
                  </label>
                  <button
                    type="button"
                    onClick={submitFeedback}
                    disabled={isSubmitting || !feedback.trim()}
                    className="mt-4 w-full rounded-[8px] bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit feedback'}
                  </button>
                  {data.googleReviewUrl && (
                    <a
                      href={data.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block w-full rounded-[8px] border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 transition-colors hover:border-blue-500 hover:text-blue-700"
                    >
                      Leave a review on Google instead
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <p className="mt-5 text-center text-xs font-semibold text-slate-500">
          Powered by <Link to="/" className="font-bold text-blue-700">ReviewNest</Link>
        </p>
      </main>
    </div>
  );
}

import api from './client';

export interface ReviewRequest {
  _id: string;
  token: string;
  businessId: string;
  customerId: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  sentAt: string;
  clickedAt: string | null;
  outcome: 'pending' | 'google' | 'feedback';
  starRating: number | null;
  resendCount: number;
  isResend: boolean;
  needsResend: boolean;
  whatsappMessage: string;
  emailMessage?: string;
  emailSentAt?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface SendReviewPayload {
  customerId: string;
}

export const sendReviewRequestApi = async (payload: SendReviewPayload) => {
  const res = await api.post('/reviews/send', payload);
  return res.data;
};

export interface PaginatedReviewRequests {
  requests: ReviewRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export const getReviewRequestsApi = async (params?: { page?: number, limit?: number, search?: string, status?: string }) => {
  const res = await api.get('/reviews', { params });
  return res.data as PaginatedReviewRequests;
};

export const resendReviewRequestApi = async (id: string) => {
  const res = await api.post(`/reviews/resend/${id}`);
  return res.data;
};

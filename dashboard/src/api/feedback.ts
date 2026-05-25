import api from './client';

export interface Feedback {
  _id: string;
  requestId: string;
  businessId: string;
  customerId: {
    _id: string;
    name: string;
    phone: string;
  };
  starRating: number;
  message: string;
  allowContact: boolean;
  status: 'new' | 'seen' | 'resolved';
  createdAt: string;
}

export const getFeedbackApi = async (status?: string) => {
  const params = status ? { status } : {};
  const res = await api.get('/feedback', { params });
  return res.data.feedbacks as Feedback[];
};

export const updateFeedbackStatusApi = async (id: string, status: string) => {
  const res = await api.patch(`/feedback/${id}/status`, { status });
  return res.data;
};

import api from './client';
import type { ReviewRequest } from './reviews';

export interface GrowthAnalytics {
  weeklySummary?: string;
  weeklyVolume?: Array<{ label: string; requests: number }>;
  table?: Array<{
    period: string;
    requests: number;
    clicks: number;
    positiveRatings: number;
    growth: number | null;
  }>;
}

export interface AnalyticsData {
  totalCustomers: number;
  totalRequests: number;
  clickedRequests: number;
  googleRedirects: number;
  feedbackReceived: number;
  pendingRequests: number;
  recentRequests: ReviewRequest[];
  monthlyRequests: number;
  monthlyRespondedRequests: number;
  monthlyResponseRate: number;
  googleScore?: {
    placeId?: string;
    rating: number | null;
    reviewCount: number | null;
    previousRating: number | null;
    lastSyncedAt: string | null;
    lastUpdatedLabel: string;
  } | null;
  growth?: GrowthAnalytics | null;
}

export const getAnalyticsApi = async () => {
  const res = await api.get('/business/analytics');
  return res.data as AnalyticsData;
};

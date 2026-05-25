import api from './client';

export interface RegisterPayload {
  email: string;
  businessName: string;
  ownerName: string;
  phone: string;
  businessType: string;
  googleReviewUrl: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const getSetupStatusApi = async () => {
  const res = await api.get('/auth/setup-status');
  return res.data as { isSetupComplete: boolean; hasBusiness: boolean };
};

export const registerApi = async (payload: RegisterPayload) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};

export const loginApi = async (payload: LoginPayload) => {
  const res = await api.post('/auth/login', payload);
  return res.data;
};

export const refreshApi = async () => {
  const res = await api.post('/auth/refresh');
  return res.data;
};

export const logoutApi = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

export const changePasswordApi = async (payload: { currentPassword: string; newPassword: string }) => {
  const res = await api.post('/auth/change-password', payload);
  return res.data;
};

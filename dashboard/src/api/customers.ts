import api from './client';

export interface Customer {
  _id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  isOptedOut: boolean;
  totalRequests: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface PaginatedCustomers {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export const getCustomersApi = async (params?: { page?: number, limit?: number, search?: string }) => {
  const res = await api.get('/customers', { params });
  return res.data as PaginatedCustomers;
};

export const addCustomerApi = async (payload: AddCustomerPayload) => {
  const res = await api.post('/customers', payload);
  return res.data.customer as Customer;
};

export const updateCustomerApi = async (id: string, payload: Partial<AddCustomerPayload>) => {
  const res = await api.put(`/customers/${id}`, payload);
  return res.data.customer as Customer;
};

export const deleteCustomerApi = async (id: string) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};

export const toggleOptOutApi = async (id: string) => {
  const res = await api.patch(`/customers/${id}/optout`);
  return res.data;
};

export const addBulkCustomersApi = async (customers: AddCustomerPayload[]) => {
  const res = await api.post('/customers/bulk', { customers });
  return res.data;
};

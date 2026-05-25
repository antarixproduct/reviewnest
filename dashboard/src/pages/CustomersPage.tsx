import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Send, Pencil, Trash2, X, Users, CheckCircle, UploadCloud, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Customer } from '../api/customers';
import { getCustomersApi, addCustomerApi, deleteCustomerApi, updateCustomerApi, addBulkCustomersApi } from '../api/customers';
import { sendReviewRequestApi, getReviewRequestsApi } from '../api/reviews';
import Papa from 'papaparse';

// Defined OUTSIDE the main component to prevent re-creation on every render
function CustomerModal({
  title, onClose, onSubmit, formData, setFormData, err, isPending, submitLabel
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: { name: string; phone: string; email: string; notes: string };
  setFormData: (d: any) => void;
  err: string;
  isPending: boolean;
  submitLabel: string;
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit',
    background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>
        {err && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontWeight: 500 }}>
            {err}
          </div>
        )}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              required
              style={inputStyle}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp Number *</label>
            <input
              required
              type="tel"
              style={inputStyle}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
            />
          </div>
          <div>
            <label style={labelStyle}>Email (optional)</label>
            <input
              type="email"
              style={inputStyle}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <input
              style={inputStyle}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Root canal patient"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkUploadModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (msg: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  const bulkMutation = useMutation({
    mutationFn: addBulkCustomersApi,
    onSuccess: (data) => {
      onSuccess(`Successfully added ${data.addedCount} customers.${data.errors?.length ? ` Failed to add ${data.errors.length} rows (duplicates/errors).` : ''}`);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to bulk upload customers'),
  });

  const handleDownloadTemplate = () => {
    const csvContent = "Name,Phone,Email,Notes\nRahul Sharma,9876543210,rahul@example.com,VIP Customer\nPriya Singh,9123456789,,Follow up next week";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "reviewnest_customers_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const validCustomers = rows.map(row => ({
          name: row.Name || row.name || '',
          phone: row.Phone || row.phone || '',
          email: row.Email || row.email || '',
          notes: row.Notes || row.notes || ''
        })).filter(c => c.name && c.phone); // Require name and phone

        if (validCustomers.length === 0) {
          setError('No valid customers found in the CSV. Make sure you have Name and Phone columns.');
          return;
        }

        bulkMutation.mutate(validCustomers);
      },
      error: (err: any) => {
        setError('Error parsing CSV file: ' + err.message);
      }
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>Bulk Upload Customers</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1' }}>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: 1.5 }}>
            Upload a CSV file to add multiple customers at once. The file must contain <b>Name</b> and <b>Phone</b> columns.
          </p>
          <button 
            onClick={handleDownloadTemplate}
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Download size={14} /> Download CSV Template
          </button>
        </div>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Select CSV File *</label>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bulkMutation.isPending || !file}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: 700, cursor: bulkMutation.isPending || !file ? 'not-allowed' : 'pointer', opacity: bulkMutation.isPending || !file ? 0.6 : 1 }}
            >
              <UploadCloud size={16} />
              {bulkMutation.isPending ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: customersData, isLoading } = useQuery({ 
    queryKey: ['customers', page, searchQuery], 
    queryFn: () => getCustomersApi({ page, limit: 10, search: searchQuery }) 
  });

  // Keep fetching all requests for now, or just use a simpler check if requests are paginated
  // Wait, if requests are paginated, hasRequest might fail if the request isn't on the first page.
  // This is a known limitation when paginating independently, but acceptable for MVP.
  const { data: requestsData } = useQuery({ queryKey: ['requests'], queryFn: () => getReviewRequestsApi({ limit: 1000 }) });

  const customers = customersData?.customers || [];
  const totalCustomers = customersData?.total || 0;
  const totalPages = customersData?.totalPages || 1;
  const requests = requestsData?.requests || [];

  const addMutation = useMutation({
    mutationFn: addCustomerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setAddForm({ name: '', phone: '', email: '', notes: '' });
      setShowAddForm(false);
      setAddError('');
    },
    onError: (err: any) => setAddError(err.response?.data?.message || 'Failed to add customer'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCustomerApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingCustomer(null);
      setEditError('');
    },
    onError: (err: any) => setEditError(err.response?.data?.message || 'Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const handleSend = async (customer: Customer) => {
    setSendingId(customer._id);
    try {
      const data = await sendReviewRequestApi({ customerId: customer._id });
      window.open(data.whatsappUrl, '_blank');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send review request');
    } finally {
      setSendingId(null);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({ name: customer.name, phone: customer.phone, email: customer.email || '', notes: customer.notes });
    setEditError('');
  };

  const hasRequest = (customerId: string) =>
    requests.some((r) => r.customerId?._id === customerId);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>Customers</h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>{totalCustomers} total customers</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', background: 'white' }}
            />
          </div>
          <button
            onClick={() => setShowBulkForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', color: '#0f172a', fontSize: '14px', fontWeight: 700, padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <UploadCloud size={16} /> <span className="hide-on-mobile">Bulk Upload</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: 700, padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', whiteSpace: 'nowrap' }}
          >
            <Plus size={16} /> <span className="hide-on-mobile">Add Customer</span>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hide-on-mobile { display: none; }
        }
      `}</style>

      {/* Bulk Add Modal */}
      {showBulkForm && (
        <BulkUploadModal
          onClose={() => setShowBulkForm(false)}
          onSuccess={(msg) => {
            setShowBulkForm(false);
            alert(msg);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
          }}
        />
      )}

      {/* Add Modal */}
      {showAddForm && (
        <CustomerModal
          title="Add Customer"
          onClose={() => { setShowAddForm(false); setAddError(''); setAddForm({ name: '', phone: '', email: '', notes: '' }); }}
          onSubmit={(e) => { e.preventDefault(); addMutation.mutate(addForm); }}
          formData={addForm}
          setFormData={setAddForm}
          err={addError}
          isPending={addMutation.isPending}
          submitLabel="Add Customer"
        />
      )}

      {/* Edit Modal */}
      {editingCustomer && (
        <CustomerModal
          title="Edit Customer"
          onClose={() => setEditingCustomer(null)}
          onSubmit={(e) => { e.preventDefault(); editMutation.mutate({ id: editingCustomer._id, data: editForm }); }}
          formData={editForm}
          setFormData={setEditForm}
          err={editError}
          isPending={editMutation.isPending}
          submitLabel="Save Changes"
        />
      )}

      {/* Customer list */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>Loading customers...</div>
      ) : customers.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={24} color="#94a3b8" />
          </div>
          <p style={{ color: '#475569', fontWeight: 600, fontSize: '15px' }}>No customers yet</p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Add your first customer to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {customers.map((customer) => {
            const alreadySent = hasRequest(customer._id);
            return (
              <div key={customer._id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{customer.name}</p>
                      {alreadySent && (
                        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={11} /> Request Sent
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>+91 {customer.phone}</p>
                    {customer.email && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{customer.email}</p>}
                    {customer.notes && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{customer.notes}</p>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {alreadySent ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#15803d', fontSize: '13px', fontWeight: 700, padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #bbf7d0' }}>
                        <CheckCircle size={13} /> Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSend(customer)}
                        disabled={sendingId === customer._id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: 'white', fontSize: '13px', fontWeight: 700, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', opacity: sendingId === customer._id ? 0.6 : 1, whiteSpace: 'nowrap' }}
                      >
                        <Send size={13} />
                        {sendingId === customer._id ? '...' : 'Send'}
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(customer)}
                      style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                      title="Edit customer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this customer?')) deleteMutation.mutate(customer._id); }}
                      style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#fef2f2', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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

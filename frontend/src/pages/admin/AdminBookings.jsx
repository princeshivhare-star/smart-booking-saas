import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { BookingStatusBadge, PaymentStatusBadge, Modal } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, Filter, RefreshCw, Eye, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('all');
  const [search, setSearch]     = useState('');
  const [date, setDate]         = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status !== 'all') params.status = status;
      if (date)             params.date   = date;
      const res = await api.get('/bookings', { params });
      setBookings(res.data.bookings);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [status, date, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
      fetchBookings();
      setSelected(null);
    } catch (err) {
      toast.error('Update failed.');
    }
  };

  const markPaid = async (bookingId) => {
    try {
      await api.put(`/payments/${bookingId}/mark-paid`);
      toast.success('Marked as paid');
      fetchBookings();
      setSelected(null);
    } catch (err) {
      toast.error('Update failed.');
    }
  };

  const filtered = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.customerId?.firstName?.toLowerCase().includes(q) ||
      b.customerId?.lastName?.toLowerCase().includes(q)  ||
      b.customerId?.email?.toLowerCase().includes(q)     ||
      b.bookingRef?.toLowerCase().includes(q)            ||
      b.serviceId?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">Bookings</h1>
        <button onClick={fetchBookings} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm" placeholder="Search by name, ref, service..." />
        </div>
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }}
          className="input text-sm w-auto" />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input text-sm w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Ref', 'Customer', 'Service', 'Date & Time', 'Staff', 'Status', 'Payment', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400">No bookings found</td></tr>
                ) : filtered.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{b.bookingRef}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{b.customerId?.firstName} {b.customerId?.lastName}</p>
                      <p className="text-xs text-slate-400">{b.customerId?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{b.serviceId?.name}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 whitespace-nowrap">{b.date}</p>
                      <p className="text-xs text-slate-400">{b.startTime} – {b.endTime}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {b.staffId ? `${b.staffId.firstName} ${b.staffId.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={b.payment?.status} />
                      <p className="text-xs text-slate-400 mt-0.5">${b.payment?.amount} · {b.payment?.method}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(b)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Showing {filtered.length} of {pagination.total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Prev</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Booking #${selected?.bookingRef}`}
        footer={
          selected && (
            <>
              {selected.status === 'pending' && (
                <button onClick={() => updateStatus(selected._id, 'confirmed')} className="btn-primary flex items-center gap-2 text-sm">
                  <CheckCircle size={14} /> Confirm
                </button>
              )}
              {['pending', 'confirmed'].includes(selected.status) && (
                <button onClick={() => updateStatus(selected._id, 'completed')} className="btn-secondary flex items-center gap-2 text-sm">
                  <CheckCircle size={14} /> Mark Complete
                </button>
              )}
              {selected.payment?.status !== 'paid' && (
                <button onClick={() => markPaid(selected._id)} className="btn-secondary flex items-center gap-2 text-sm">
                  <DollarSign size={14} /> Mark Paid
                </button>
              )}
              {!['cancelled', 'completed'].includes(selected.status) && (
                <button onClick={() => updateStatus(selected._id, 'cancelled')} className="btn-danger flex items-center gap-2 text-sm">
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <Row label="Customer"  value={`${selected.customerId?.firstName} ${selected.customerId?.lastName}`} />
            <Row label="Email"     value={selected.customerId?.email} />
            <Row label="Phone"     value={selected.customerId?.phone || '—'} />
            <Row label="Service"   value={selected.serviceId?.name} />
            <Row label="Date"      value={selected.date} />
            <Row label="Time"      value={`${selected.startTime} – ${selected.endTime}`} />
            <Row label="Staff"     value={selected.staffId ? `${selected.staffId.firstName} ${selected.staffId.lastName}` : 'Any'} />
            <Row label="Status"    value={<BookingStatusBadge status={selected.status} />} />
            <Row label="Payment"   value={<><PaymentStatusBadge status={selected.payment?.status} /> <span className="ml-2 text-slate-500">${selected.payment?.amount}</span></>} />
            {selected.notes && <Row label="Notes" value={selected.notes} />}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-400 font-medium w-28 shrink-0">{label}</span>
      <span className="text-slate-700 text-right">{value}</span>
    </div>
  );
}

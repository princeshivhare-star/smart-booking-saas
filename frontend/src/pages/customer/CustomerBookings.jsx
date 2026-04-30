import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { BookingStatusBadge, PaymentStatusBadge, Modal } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Calendar, Clock, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

const TABS = ['all', 'upcoming', 'completed', 'cancelled'];

export default function CustomerBookings() {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newDate, setNewDate]           = useState('');
  const [newTime, setNewTime]           = useState('');
  const [slots, setSlots]               = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings', { params: { limit: 50 } });
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Fetch slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleTarget || !newDate) return;
    setSlotsLoading(true);
    api.get('/bookings/availability', {
      params: {
        serviceId: rescheduleTarget.serviceId?._id,
        staffId:   rescheduleTarget.staffId?._id,
        date:      newDate,
      },
    })
      .then(res => setSlots(res.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [newDate, rescheduleTarget]);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api.put(`/bookings/${cancelTarget._id}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled.');
      setCancelTarget(null);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) { toast.error('Please select a date and time.'); return; }
    setActionLoading(true);
    try {
      await api.put(`/bookings/${rescheduleTarget._id}/reschedule`, { date: newDate, startTime: newTime });
      toast.success('Booking rescheduled.');
      setRescheduleTarget(null);
      setNewDate(''); setNewTime('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const openReschedule = (b) => {
    setRescheduleTarget(b);
    setNewDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    setNewTime('');
  };

  const filtered = bookings.filter(b => {
    if (tab === 'all')       return true;
    if (tab === 'upcoming')  return ['confirmed', 'pending'].includes(b.status) && b.date >= today;
    if (tab === 'completed') return b.status === 'completed';
    if (tab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">My Bookings</h1>
        <button onClick={fetchBookings} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="text-slate-400 font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={17} className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-slate-800">{b.serviceId?.name}</p>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-sm text-slate-500 mb-0.5">{b.businessId?.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {b.date} · {b.startTime} – {b.endTime}
                    </p>
                    {b.staffId && (
                      <p className="text-xs text-slate-400 mt-0.5">Staff: {b.staffId.firstName} {b.staffId.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">${b.payment?.amount}</p>
                  <PaymentStatusBadge status={b.payment?.status} />
                </div>
              </div>

              {/* Ref */}
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Ref: #{b.bookingRef}</span>
                {['confirmed', 'pending'].includes(b.status) && b.date >= today && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openReschedule(b)}
                      className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <RefreshCw size={12} /> Reschedule
                    </button>
                    <button
                      onClick={() => setCancelTarget(b)}
                      className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 font-medium"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </div>
                )}
              </div>
              {b.notes && (
                <p className="text-xs text-slate-400 mt-2 italic">Note: {b.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => { setCancelTarget(null); setCancelReason(''); }}
        title="Cancel Booking"
        footer={
          <>
            <button onClick={() => { setCancelTarget(null); setCancelReason(''); }} className="btn-secondary text-sm">Keep Booking</button>
            <button onClick={handleCancel} disabled={actionLoading} className="btn-danger text-sm">
              {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3 mb-4 p-3 bg-red-50 rounded-xl">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            Are you sure you want to cancel your <strong>{cancelTarget?.serviceId?.name}</strong> appointment on <strong>{cancelTarget?.date}</strong>?
          </p>
        </div>
        <div>
          <label className="label">Reason (optional)</label>
          <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
            className="input resize-none" rows={3} placeholder="Why are you cancelling?" />
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleTarget}
        onClose={() => { setRescheduleTarget(null); setNewDate(''); setNewTime(''); }}
        title="Reschedule Booking"
        footer={
          <>
            <button onClick={() => { setRescheduleTarget(null); setNewDate(''); setNewTime(''); }} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleReschedule} disabled={actionLoading || !newTime} className="btn-primary text-sm">
              {actionLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            Rescheduling: <strong>{rescheduleTarget?.serviceId?.name}</strong>
          </div>
          <div>
            <label className="label">New Date</label>
            <input type="date" value={newDate} min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              onChange={e => { setNewDate(e.target.value); setNewTime(''); }} className="input" />
          </div>
          {newDate && (
            <div>
              <label className="label">New Time</label>
              {slotsLoading ? (
                <LoadingSpinner size="sm" />
              ) : slots.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {slots.map(slot => (
                    <button key={slot} onClick={() => setNewTime(slot)}
                      className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                        newTime === slot ? 'border-primary-500 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300'
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

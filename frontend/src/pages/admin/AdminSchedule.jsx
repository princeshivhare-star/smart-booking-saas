import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

const EMPTY_FORM = { staffId: '', date: '', startTime: '', endTime: '', reason: '', type: 'blocked' };
const BLOCK_TYPES = ['blocked', 'break', 'holiday', 'vacation'];

export default function AdminSchedule() {
  const [slots, setSlots]         = useState([]);
  const [staff, setStaff]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [businessId, setBusinessId] = useState(null);

  // Date range: today + 30 days
  const today = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const fetchData = async () => {
    setLoading(true);
    try {
      const bizRes = await api.get('/businesses/mine');
      const biz = bizRes.data.business;
      setBusinessId(biz._id);

      const [slotsRes, staffRes] = await Promise.all([
        api.get('/schedules/blocked', { params: { businessId: biz._id, startDate: today, endDate } }),
        api.get(`/businesses/${biz._id}/staff`),
      ]);
      setSlots(slotsRes.data.slots);
      setStaff(staffRes.data.staff);
    } catch (err) {
      toast.error('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBlock = async () => {
    if (!form.date || !form.startTime || !form.endTime) {
      toast.error('Date, start time and end time are required.'); return;
    }
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time.'); return;
    }
    setSaving(true);
    try {
      await api.post('/schedules/blocked', form);
      toast.success('Time slot blocked.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Unblock this slot?')) return;
    try {
      await api.delete(`/schedules/blocked/${id}`);
      toast.success('Slot unblocked.');
      fetchData();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const typeColors = {
    blocked:  'badge-red',
    break:    'badge-yellow',
    holiday:  'badge-blue',
    vacation: 'badge-gray',
  };

  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Schedule</h1>
          <p className="text-sm text-slate-400 mt-0.5">Block time slots to prevent bookings</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Block Slot
        </button>
      </div>

      {loading ? <LoadingSpinner /> : Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="text-slate-400 font-medium">No blocked slots</p>
          <p className="text-sm text-slate-300 mt-1">All time slots are currently available for booking.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm mt-4">Block a Slot</button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, daySlots]) => (
            <div key={date} className="card overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">
                  {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d yyyy')}
                </span>
                <span className="badge-gray ml-auto">{daySlots.length} slot{daySlots.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {daySlots.map(slot => (
                  <div key={slot._id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Clock size={14} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {slot.startTime} – {slot.endTime}
                          {slot.staffId && (
                            <span className="ml-2 text-xs text-slate-400">
                              · {slot.staffId.firstName} {slot.staffId.lastName}
                            </span>
                          )}
                          {!slot.staffId && <span className="ml-2 text-xs text-slate-400">· All Staff</span>}
                        </p>
                        {slot.reason && <p className="text-xs text-slate-400">{slot.reason}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={typeColors[slot.type] || 'badge-gray'}>{slot.type}</span>
                      <button onClick={() => handleDelete(slot._id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
        title="Block Time Slot"
        footer={
          <>
            <button onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleBlock} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : 'Block Slot'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Staff Member</label>
            <select value={form.staffId} onChange={e => setForm(p => ({ ...p, staffId: e.target.value }))} className="input">
              <option value="">All Staff (whole business)</option>
              {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date *</label>
            <input type="date" value={form.date} min={today}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Time *</label>
              <input type="time" value={form.startTime}
                onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">End Time *</label>
              <input type="time" value={form.endTime}
                onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input">
              {BLOCK_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Reason (optional)</label>
            <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              className="input" placeholder="e.g. Staff training, Public holiday..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}

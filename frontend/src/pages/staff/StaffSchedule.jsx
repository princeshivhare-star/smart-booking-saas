import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = { date: '', startTime: '', endTime: '', reason: '', type: 'blocked' };

export default function StaffSchedule() {
  const { user } = useAuth();
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const today   = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const bizRes = await api.get('/businesses/mine').catch(() => null);
      const businessId = bizRes?.data?.business?._id || user?.businessId;
      const res = await api.get('/schedules/blocked', {
        params: { businessId, staffId: user._id, startDate: today, endDate },
      });
      setSlots(res.data.slots);
    } catch (err) {
      toast.error('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleBlock = async () => {
    if (!form.date || !form.startTime || !form.endTime) {
      toast.error('Date and times are required.'); return;
    }
    setSaving(true);
    try {
      await api.post('/schedules/blocked', { ...form, staffId: user._id });
      toast.success('Time blocked.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchSlots();
    } catch (err) {
      toast.error('Failed to block slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Unblock this slot?')) return;
    try {
      await api.delete(`/schedules/blocked/${id}`);
      toast.success('Slot unblocked.');
      fetchSlots();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">My Schedule</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your availability</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Block Time
        </button>
      </div>

      {loading ? <LoadingSpinner /> : slots.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="text-slate-400 font-medium">No blocked times</p>
          <p className="text-sm text-slate-300 mt-1">You're fully available. Block time for breaks or time-off.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm mt-4">Block Time</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-50">
            {slots.map(slot => (
              <div key={slot._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Clock size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {format(new Date(slot.date + 'T00:00:00'), 'EEE, MMM d')} · {slot.startTime}–{slot.endTime}
                    </p>
                    {slot.reason && <p className="text-xs text-slate-400">{slot.reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge-${slot.type === 'blocked' ? 'red' : slot.type === 'break' ? 'yellow' : 'blue'}`}>
                    {slot.type}
                  </span>
                  <button onClick={() => handleDelete(slot._id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
        title="Block Time"
        footer={
          <>
            <button onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleBlock} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : 'Block Time'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
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
              {['blocked','break','holiday','vacation'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Reason (optional)</label>
            <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              className="input" placeholder="e.g. Lunch break, Doctor's appointment..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}

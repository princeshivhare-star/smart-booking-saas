import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal, EmptyState } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users, Mail, Phone } from 'lucide-react';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', phone: '' };

export default function AdminStaff() {
  const [staff, setStaff]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [businessId, setBusinessId] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const bizRes = await api.get('/businesses/mine');
      const biz = bizRes.data.business;
      setBusinessId(biz._id);
      const res = await api.get(`/businesses/${biz._id}/staff`);
      setStaff(res.data.staff);
    } catch (err) {
      toast.error('Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async () => {
    if (!form.firstName || !form.email || !form.password) {
      toast.error('First name, email, and password are required.'); return;
    }
    setSaving(true);
    try {
      await api.post('/businesses/staff', form);
      toast.success('Staff member added.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await api.delete(`/businesses/staff/${id}`);
      toast.success('Staff member removed.');
      fetchStaff();
    } catch {
      toast.error('Remove failed.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">Staff</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {loading ? <LoadingSpinner /> : staff.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No staff members yet"
            description="Add staff members so customers can book with specific people."
            action={<button onClick={() => setModalOpen(true)} className="btn-primary text-sm">Add Staff</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(s => (
            <div key={s._id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-display font-bold text-lg">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <button onClick={() => handleRemove(s._id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-semibold text-slate-800">{s.firstName} {s.lastName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Mail size={11} /> {s.email}
              </p>
              {s.phone && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> {s.phone}
                </p>
              )}
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-slate-400">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
        title="Add Staff Member"
        footer={
          <>
            <button onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Adding...' : 'Add Staff'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <input name="firstName" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Temporary Password *</label>
            <input name="password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

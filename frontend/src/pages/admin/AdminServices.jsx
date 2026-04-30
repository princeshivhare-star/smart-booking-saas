import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal, EmptyState } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Scissors, Clock, DollarSign } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', duration: 30, price: '', currency: 'USD', category: '', bufferTime: 0 };

export default function AdminServices() {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/businesses/mine');
      const biz = res.data.business;
      const svcRes = await api.get('/services', { params: { businessId: biz._id } });
      setServices(svcRes.data.services);
    } catch (err) {
      toast.error('Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit   = (svc) => {
    setEditing(svc);
    setForm({ name: svc.name, description: svc.description || '', duration: svc.duration, price: svc.price, currency: svc.currency, category: svc.category || '', bufferTime: svc.bufferTime || 0 });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) {
      toast.error('Name, price, and duration are required.'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/services/${editing._id}`, form);
        toast.success('Service updated.');
      } else {
        await api.post('/services', form);
        toast.success('Service created.');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted.');
      fetchServices();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">Services</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {loading ? <LoadingSpinner /> : services.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Scissors}
            title="No services yet"
            description="Add your first service to start accepting bookings."
            action={<button onClick={openCreate} className="btn-primary text-sm">Add Service</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(svc => (
            <div key={svc._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Scissors size={18} className="text-primary-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(svc)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(svc._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{svc.name}</h3>
              {svc.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{svc.description}</p>}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock size={12} />{svc.duration} min</span>
                <span className="flex items-center gap-1"><DollarSign size={12} />{svc.price} {svc.currency}</span>
                {svc.category && <span className="badge-gray">{svc.category}</span>}
              </div>
              {svc.bufferTime > 0 && (
                <p className="text-xs text-slate-300 mt-2">+{svc.bufferTime} min buffer</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Service' : 'New Service'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Service'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Service Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Haircut & Style" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input resize-none" rows={2} placeholder="Brief description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration (min) *</label>
              <input name="duration" type="number" min="5" value={form.duration} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Buffer Time (min)</label>
              <input name="bufferTime" type="number" min="0" value={form.bufferTime} onChange={handleChange} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="input">
                {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="input" placeholder="e.g. Hair, Nails, Wellness" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

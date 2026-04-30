import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Save, Building2, Clock, CreditCard, Globe } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const defaultHours = () =>
  Object.fromEntries(DAYS.map(d => [d, { open: '09:00', close: '18:00', isOpen: d !== 'saturday' && d !== 'sunday' }]));

export default function AdminSettings() {
  const [business, setBusiness]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    name: '', description: '', category: 'other',
    contact: { email: '', phone: '', website: '' },
    address: { street: '', city: '', state: '', country: '', zip: '' },
    workingHours: defaultHours(),
    settings: { bookingInterval: 30, maxAdvanceBooking: 30, cancellationPolicy: 24, autoConfirm: true, currency: 'USD' },
  });

  useEffect(() => {
    api.get('/businesses/mine')
      .then(res => {
        const biz = res.data.business;
        setBusiness(biz);
        setForm({
          name: biz.name || '',
          description: biz.description || '',
          category: biz.category || 'other',
          contact: { email: biz.contact?.email || '', phone: biz.contact?.phone || '', website: biz.contact?.website || '' },
          address: { street: biz.address?.street || '', city: biz.address?.city || '', state: biz.address?.state || '', country: biz.address?.country || '', zip: biz.address?.zip || '' },
          workingHours: biz.workingHours || defaultHours(),
          settings: { bookingInterval: biz.settings?.bookingInterval || 30, maxAdvanceBooking: biz.settings?.maxAdvanceBooking || 30, cancellationPolicy: biz.settings?.cancellationPolicy || 24, autoConfirm: biz.settings?.autoConfirm ?? true, currency: biz.settings?.currency || 'USD' },
        });
      })
      .catch(() => toast.error('Failed to load business.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/businesses/${business._id}`, form);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const setHours = (day, field, val) => {
    setForm(p => ({ ...p, workingHours: { ...p.workingHours, [day]: { ...p.workingHours[day], [field]: val } } }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Business Info */}
      <Section icon={Building2} title="Business Information">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Business Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="input resize-none" rows={2} />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input">
                {['barbershop','clinic','salon','workshop','consultant','spa','gym','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Email</label>
              <input type="email" value={form.contact.email}
                onChange={e => setForm(p => ({ ...p, contact: { ...p.contact, email: e.target.value } }))} className="input" />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input value={form.contact.phone}
                onChange={e => setForm(p => ({ ...p, contact: { ...p.contact, phone: e.target.value } }))} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Website</label>
              <input value={form.contact.website}
                onChange={e => setForm(p => ({ ...p, contact: { ...p.contact, website: e.target.value } }))} className="input" placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Street Address</label>
              <input value={form.address.street}
                onChange={e => setForm(p => ({ ...p, address: { ...p.address, street: e.target.value } }))} className="input" />
            </div>
            <div>
              <label className="label">City</label>
              <input value={form.address.city}
                onChange={e => setForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} className="input" />
            </div>
            <div>
              <label className="label">State / Province</label>
              <input value={form.address.state}
                onChange={e => setForm(p => ({ ...p, address: { ...p.address, state: e.target.value } }))} className="input" />
            </div>
            <div>
              <label className="label">Country</label>
              <input value={form.address.country}
                onChange={e => setForm(p => ({ ...p, address: { ...p.address, country: e.target.value } }))} className="input" />
            </div>
            <div>
              <label className="label">ZIP / Postal Code</label>
              <input value={form.address.zip}
                onChange={e => setForm(p => ({ ...p, address: { ...p.address, zip: e.target.value } }))} className="input" />
            </div>
          </div>
        </div>
      </Section>

      {/* Working Hours */}
      <Section icon={Clock} title="Working Hours">
        <div className="space-y-2">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-24">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.workingHours[day]?.isOpen || false}
                    onChange={e => setHours(day, 'isOpen', e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm font-medium text-slate-700 capitalize">{day.slice(0, 3)}</span>
                </label>
              </div>
              {form.workingHours[day]?.isOpen ? (
                <>
                  <input type="time" value={form.workingHours[day]?.open || '09:00'}
                    onChange={e => setHours(day, 'open', e.target.value)}
                    className="input text-sm w-32" />
                  <span className="text-slate-400 text-sm">to</span>
                  <input type="time" value={form.workingHours[day]?.close || '18:00'}
                    onChange={e => setHours(day, 'close', e.target.value)}
                    className="input text-sm w-32" />
                </>
              ) : (
                <span className="text-sm text-slate-400 italic">Closed</span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Booking Settings */}
      <Section icon={CreditCard} title="Booking Settings">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Booking Interval (min)</label>
            <select value={form.settings.bookingInterval}
              onChange={e => setForm(p => ({ ...p, settings: { ...p.settings, bookingInterval: +e.target.value } }))} className="input">
              {[10, 15, 20, 30, 45, 60].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
          <div>
            <label className="label">Max Advance Booking (days)</label>
            <input type="number" min="1" max="365" value={form.settings.maxAdvanceBooking}
              onChange={e => setForm(p => ({ ...p, settings: { ...p.settings, maxAdvanceBooking: +e.target.value } }))} className="input" />
          </div>
          <div>
            <label className="label">Cancellation Policy (hours notice)</label>
            <input type="number" min="0" value={form.settings.cancellationPolicy}
              onChange={e => setForm(p => ({ ...p, settings: { ...p.settings, cancellationPolicy: +e.target.value } }))} className="input" />
          </div>
          <div>
            <label className="label">Currency</label>
            <select value={form.settings.currency}
              onChange={e => setForm(p => ({ ...p, settings: { ...p.settings, currency: e.target.value } }))} className="input">
              {['USD','EUR','GBP','CAD','AUD','INR'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.settings.autoConfirm}
                onChange={e => setForm(p => ({ ...p, settings: { ...p.settings, autoConfirm: e.target.checked } }))}
                className="w-4 h-4 rounded text-primary-600" />
              <div>
                <span className="text-sm font-medium text-slate-700">Auto-confirm bookings</span>
                <p className="text-xs text-slate-400">Bookings are automatically confirmed without manual approval</p>
              </div>
            </label>
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-primary-600" />
        </div>
        <h2 className="font-display font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

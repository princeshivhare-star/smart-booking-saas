import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    role: params.get('role') || 'customer',
    businessName: '', businessCategory: 'other',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      if (user.role === 'admin')    navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-800">SmartBook</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Start managing bookings in minutes</p>
        </div>

        <div className="card p-6">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-100 rounded-xl">
            {[
              { value: 'customer', label: '👤 Customer' },
              { value: 'admin',    label: '🏢 Business Owner' },
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r.value }))}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${form.role === r.value ? 'bg-white shadow text-primary-700' : 'text-slate-500'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange}
                  className="input" placeholder="John" required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange}
                  className="input" placeholder="Doe" required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="input" placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                className="input" placeholder="+1 234 567 8900" />
            </div>

            {form.role === 'admin' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Details</p>
                <div>
                  <label className="label">Business Name</label>
                  <input name="businessName" value={form.businessName} onChange={handleChange}
                    className="input" placeholder="My Awesome Salon" required />
                </div>
                <div>
                  <label className="label">Business Category</label>
                  <select name="businessCategory" value={form.businessCategory} onChange={handleChange} className="input">
                    {['barbershop', 'clinic', 'salon', 'workshop', 'consultant', 'spa', 'gym', 'other'].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass]       = useState(false);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error('Update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassSave = async () => {
    if (passForm.newPassword !== passForm.confirm) {
      toast.error('New passwords do not match.'); return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.'); return;
    }
    setSavingPass(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword:     passForm.newPassword,
      });
      toast.success('Password changed.');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="font-display text-2xl font-bold text-slate-800">My Profile</h1>

      {/* Avatar */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-display font-bold text-2xl">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className="badge-blue mt-1">Customer</span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
            <User size={15} className="text-primary-600" />
          </div>
          <h2 className="font-display font-semibold text-slate-800">Personal Information</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input value={profileForm.firstName}
                onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input value={profileForm.lastName}
                onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email} disabled className="input bg-slate-50 text-slate-400 cursor-not-allowed" />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={profileForm.phone}
              onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
              className="input" placeholder="+1 234 567 8900" />
          </div>
          <button onClick={handleProfileSave} disabled={savingProfile} className="btn-primary flex items-center gap-2 text-sm">
            <Save size={14} /> {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
            <Lock size={15} className="text-primary-600" />
          </div>
          <h2 className="font-display font-semibold text-slate-800">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" value={passForm.currentPassword}
              onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" value={passForm.newPassword}
              onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
              className="input" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" value={passForm.confirm}
              onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
              className="input" placeholder="••••••••" />
          </div>
          <button onClick={handlePassSave} disabled={savingPass} className="btn-primary flex items-center gap-2 text-sm">
            <Lock size={14} /> {savingPass ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

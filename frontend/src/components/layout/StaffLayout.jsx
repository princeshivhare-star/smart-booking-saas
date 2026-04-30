import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Clock, LogOut, Calendar, Menu } from 'lucide-react';
import { useState } from 'react';

const staffNav = [
  { to: '/staff',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/staff/schedule', icon: Clock,           label: 'My Schedule' },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100 w-64 p-5">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
          <Calendar size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl text-slate-800">SmartBook</span>
      </div>
      <nav className="flex-1 space-y-1">
        {staffNav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="pt-4 border-t border-slate-100">
        <p className="text-sm font-medium text-slate-700 px-3 mb-2">{user?.firstName} {user?.lastName}</p>
        <button onClick={() => { logout(); navigate('/login'); }} className="sidebar-link w-full text-red-500 hover:bg-red-50">
          <LogOut size={18} /><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10"><Sidebar /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 mr-2" onClick={() => setOpen(true)}>
            <Menu size={20} className="text-slate-600" />
          </button>
          <span className="font-semibold text-slate-700">Staff Portal</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

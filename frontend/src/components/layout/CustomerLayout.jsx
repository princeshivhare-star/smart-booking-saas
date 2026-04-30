import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CalendarDays, User, LogOut, Calendar, Menu, PlusCircle } from 'lucide-react';
import { useState } from 'react';

const customerNav = [
  { to: '/customer',          icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/customer/bookings', icon: CalendarDays,    label: 'My Bookings' },
  { to: '/customer/profile',  icon: User,            label: 'Profile' },
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100 w-64 p-5">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Calendar size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl text-slate-800">SmartBook</span>
      </div>

      <Link to="/businesses"
        className="flex items-center gap-2 btn-primary mb-6 justify-center"
        onClick={() => setOpen(false)}
      >
        <PlusCircle size={16} />
        Book a Service
      </Link>

      <nav className="flex-1 space-y-1">
        {customerNav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-400">Customer</p>
          </div>
        </div>
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
          <span className="font-semibold text-slate-700">My Account</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Calendar, Scissors, Users, Clock, Settings, LogOut, Menu, X, Bell
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/admin/bookings', icon: Calendar,        label: 'Bookings' },
  { to: '/admin/services', icon: Scissors,        label: 'Services' },
  { to: '/admin/staff',    icon: Users,           label: 'Staff' },
  { to: '/admin/schedule', icon: Clock,           label: 'Schedule' },
  { to: '/admin/settings', icon: Settings,        label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100 w-64 p-5">
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Calendar size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl text-slate-800">SmartBook</span>
      </div>

      <div className="mb-6 px-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Business</p>
        <p className="text-sm font-medium text-slate-700 truncate">{user?.businessName || 'Your Business'}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-400 truncate">Admin</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-700 hover:bg-red-50">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-3 flex items-center justify-between">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <Bell size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

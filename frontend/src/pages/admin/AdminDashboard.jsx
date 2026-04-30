import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { BookingStatusBadge } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Calendar, DollarSign, Users, XCircle, CheckCircle, Clock,
  TrendingUp, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)   return <div className="text-slate-400 text-center py-20">Failed to load dashboard.</div>;

  const { stats, monthlyData, staffPerformance, recentBookings } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings"    value={stats.totalBookings}    icon={Calendar}    color="blue"   />
        <StatCard title="Upcoming"          value={stats.upcomingBookings} icon={Clock}       color="purple" />
        <StatCard title="Revenue"           value={`$${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} color="green" />
        <StatCard title="Cancelled"         value={stats.cancelledBookings} icon={XCircle}   color="red"    />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Bookings"  value={stats.todayBookings}    icon={Calendar}    color="blue"   />
        <StatCard title="Completed"         value={stats.completedBookings} icon={CheckCircle} color="green" />
        <StatCard title="Paid Bookings"     value={stats.paidBookings}     icon={DollarSign}  color="green"  />
        <StatCard title="Staff Members"     value={stats.staffCount}       icon={Users}       color="purple" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Bookings Chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-primary-600" />
            <h2 className="font-display font-semibold text-slate-800">Monthly Bookings</h2>
          </div>
          {monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Revenue Chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={18} className="text-accent-500" />
            <h2 className="font-display font-semibold text-slate-800">Monthly Revenue</h2>
          </div>
          {monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(v) => [`$${v}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Staff Performance + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Staff Performance */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 mb-4">Staff Performance</h2>
          {staffPerformance.length === 0 ? (
            <div className="text-center py-10 text-slate-300 text-sm">No staff data yet</div>
          ) : (
            <div className="space-y-3">
              {staffPerformance.map(s => (
                <div key={s._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {s.staff?.firstName?.[0]}{s.staff?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.staff?.firstName} {s.staff?.lastName}</p>
                      <p className="text-xs text-slate-400">{s.totalBookings} bookings · {s.completedBookings} completed</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">${(s.revenue || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 mb-4">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="text-center py-10 text-slate-300 text-sm">No bookings yet</div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(b => (
                <div key={b._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {b.customerId?.firstName} {b.customerId?.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{b.serviceId?.name} · {b.date} {b.startTime}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

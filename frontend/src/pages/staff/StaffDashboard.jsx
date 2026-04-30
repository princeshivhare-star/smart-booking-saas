import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookingStatusBadge } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Clock, CheckCircle, User } from 'lucide-react';
import { format } from 'date-fns';

export default function StaffDashboard() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/staff')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { todayAppointments = [], upcomingAppointments = [], totalCompleted = 0 } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">My Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-slate-800">{todayAppointments.length}</p>
          <p className="text-xs text-slate-400 mt-1">Today</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-slate-800">{upcomingAppointments.length}</p>
          <p className="text-xs text-slate-400 mt-1">Upcoming</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-slate-800">{totalCompleted}</p>
          <p className="text-xs text-slate-400 mt-1">Completed</p>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-primary-600" />
          <h2 className="font-display font-semibold text-slate-800">Today's Appointments</h2>
          <span className="badge-blue ml-auto">{todayAppointments.length}</span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle size={28} className="mx-auto mb-2 text-slate-200" />
            <p className="text-slate-400 text-sm">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map(b => (
              <AppointmentCard key={b._id} booking={b} highlight />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-slate-400" />
          <h2 className="font-display font-semibold text-slate-800">Upcoming</h2>
        </div>
        {upcomingAppointments.length === 0 ? (
          <p className="text-center py-6 text-slate-300 text-sm">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map(b => (
              <AppointmentCard key={b._id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ booking: b, highlight }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${highlight ? 'border-primary-100 bg-primary-50/40' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${highlight ? 'bg-primary-100' : 'bg-slate-100'}`}>
          <User size={15} className={highlight ? 'text-primary-600' : 'text-slate-400'} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">
            {b.customerId?.firstName} {b.customerId?.lastName}
          </p>
          <p className="text-xs text-slate-400">
            {b.serviceId?.name} · {b.date} · {b.startTime}–{b.endTime}
          </p>
          {b.customerId?.phone && (
            <p className="text-xs text-slate-400">{b.customerId.phone}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <BookingStatusBadge status={b.status} />
        <span className="text-xs font-semibold text-slate-700">${b.serviceId?.price}</span>
      </div>
    </div>
  );
}

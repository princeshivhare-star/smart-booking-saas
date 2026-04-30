import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookingStatusBadge } from '../../components/common/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, PlusCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/bookings', { params: { limit: 5 } })
      .then(res => setBookings(res.data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => ['confirmed', 'pending'].includes(b.status) && b.date >= format(new Date(), 'yyyy-MM-dd'));
  const past     = bookings.filter(b => b.status === 'completed' || b.date < format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-500 rounded-2xl p-6 text-white">
        <h1 className="font-display text-2xl font-bold mb-1">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-primary-100 text-sm mb-4">
          {upcoming.length > 0
            ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''}.`
            : 'Ready to book your next appointment?'}
        </p>
        <Link to="/businesses" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-primary-50 transition-colors">
          <PlusCircle size={16} /> Book a Service
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-slate-800">{upcoming.length}</p>
          <p className="text-xs text-slate-400 mt-1">Upcoming</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-slate-800">{past.length}</p>
          <p className="text-xs text-slate-400 mt-1">Completed</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-slate-800">{bookings.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total</p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Upcoming Bookings */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary-600" />
                <h2 className="font-display font-semibold text-slate-800">Upcoming Appointments</h2>
              </div>
              <Link to="/customer/bookings" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-slate-400 text-sm">No upcoming appointments</p>
                <Link to="/businesses" className="btn-primary text-sm mt-3 inline-block">Book Now</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map(b => (
                  <BookingItem key={b._id} booking={b} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Past Bookings */}
          {past.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-slate-400" />
                <h2 className="font-display font-semibold text-slate-800">Recent History</h2>
              </div>
              <div className="space-y-3">
                {past.slice(0, 3).map(b => (
                  <BookingItem key={b._id} booking={b} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingItem({ booking: b }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
          <Calendar size={15} className="text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{b.serviceId?.name}</p>
          <p className="text-xs text-slate-400">
            {b.businessId?.name} · {b.date} · {b.startTime}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <BookingStatusBadge status={b.status} />
        <span className="text-xs font-semibold text-slate-600">${b.payment?.amount}</span>
      </div>
    </div>
  );
}

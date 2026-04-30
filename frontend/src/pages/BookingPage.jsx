import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, Clock, User, CreditCard, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

const STEPS = ['Service', 'Staff & Date', 'Time', 'Confirm'];

export default function BookingPage() {
  const { businessId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selection, setSelection] = useState({
    service: null,
    staff: null,
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: null,
    paymentMethod: 'at_location',
    notes: '',
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const [bizRes, svcRes, staffRes] = await Promise.all([
          api.get(`/businesses/${businessId}`),
          api.get('/services', { params: { businessId } }),
          api.get(`/businesses/${businessId}/staff`),
        ]);
        setBusiness(bizRes.data.business);
        setServices(svcRes.data.services);
        setStaff(staffRes.data.staff);
      } catch (err) {
        toast.error('Business not found.');
        navigate('/businesses');
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [businessId]);

  useEffect(() => {
    if (!selection.service || !selection.date) return;
    setSlotsLoading(true);
    api.get('/bookings/availability', {
      params: {
        serviceId: selection.service._id,
        staffId:   selection.staff?._id,
        date:      selection.date,
      },
    })
      .then(res => setSlots(res.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selection.service, selection.staff, selection.date]);

  const handleConfirm = async () => {
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        serviceId:     selection.service._id,
        staffId:       selection.staff?._id,
        date:          selection.date,
        startTime:     selection.time,
        paymentMethod: selection.paymentMethod,
        notes:         selection.notes,
      });
      toast.success(`Booking confirmed! Ref: ${res.data.booking.bookingRef}`);
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate 14 days of dates
  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/businesses" className="text-slate-400 hover:text-slate-600">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-slate-800">{business?.name}</h1>
            <p className="text-xs text-slate-400 capitalize">{business?.category}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary-700' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* STEP 0: Service Selection */}
        {step === 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Choose a service</h2>
            {services.length === 0 ? (
              <div className="card p-10 text-center text-slate-400">No services available.</div>
            ) : (
              <div className="space-y-3">
                {services.map(svc => (
                  <button
                    key={svc._id}
                    onClick={() => { setSelection(p => ({ ...p, service: svc, time: null })); setStep(1); }}
                    className={`card w-full p-4 flex items-center justify-between hover:border-primary-200 hover:shadow-sm transition-all text-left ${
                      selection.service?._id === svc._id ? 'border-primary-400 bg-primary-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Calendar size={18} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{svc.name}</p>
                        <p className="text-xs text-slate-400">{svc.duration} min{svc.description ? ` · ${svc.description}` : ''}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-slate-800">${svc.price}</p>
                      <p className="text-xs text-slate-400">{svc.currency || 'USD'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Staff & Date */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Pick staff & date</h2>

            {/* Staff Selection */}
            {staff.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Select Staff (optional)</h3>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setSelection(p => ({ ...p, staff: null }))}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      !selection.staff ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Any Available
                  </button>
                  {staff.map(s => (
                    <button
                      key={s._id}
                      onClick={() => setSelection(p => ({ ...p, staff: s }))}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        selection.staff?._id === s._id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {s.firstName} {s.lastName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 mb-3">Select Date</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dateOptions.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isSelected = selection.date === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelection(p => ({ ...p, date: dateStr, time: null }))}
                      className={`flex flex-col items-center p-3 rounded-xl border min-w-[60px] transition-all ${
                        isSelected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200'
                      }`}
                    >
                      <span className="text-[11px] font-medium">{format(date, 'EEE')}</span>
                      <span className="text-lg font-bold">{format(date, 'd')}</span>
                      <span className="text-[11px]">{format(date, 'MMM')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1">Continue</button>
            </div>
          </div>
        )}

        {/* STEP 2: Time Slot */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-2">Choose a time</h2>
            <p className="text-sm text-slate-400 mb-5">{selection.date} · {selection.service?.name}</p>

            {slotsLoading ? (
              <LoadingSpinner />
            ) : slots.length === 0 ? (
              <div className="card p-10 text-center text-slate-400">
                <Clock size={32} className="mx-auto mb-2 opacity-40" />
                <p>No available slots for this date.</p>
                <p className="text-sm mt-1">Try a different date or staff member.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelection(p => ({ ...p, time: slot }))}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selection.time === slot
                        ? 'border-primary-500 bg-primary-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(3)} disabled={!selection.time} className="btn-primary flex-1">Continue</button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Confirm your booking</h2>

            <div className="card p-5 mb-5 space-y-3">
              <SummaryRow icon={Calendar} label="Service" value={selection.service?.name} />
              <SummaryRow icon={Clock} label="Duration" value={`${selection.service?.duration} minutes`} />
              <SummaryRow icon={Calendar} label="Date" value={selection.date} />
              <SummaryRow icon={Clock} label="Time" value={selection.time} />
              {selection.staff && <SummaryRow icon={User} label="Staff" value={`${selection.staff.firstName} ${selection.staff.lastName}`} />}
              <div className="border-t border-slate-100 pt-3">
                <SummaryRow icon={CreditCard} label="Total" value={`$${selection.service?.price} ${selection.service?.currency || 'USD'}`} bold />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-5">
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'at_location', label: '💵 Pay at Location' },
                  { value: 'online',      label: '💳 Pay Online' },
                ].map(pm => (
                  <button
                    key={pm.value}
                    onClick={() => setSelection(p => ({ ...p, paymentMethod: pm.value }))}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      selection.paymentMethod === pm.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="label">Notes (optional)</label>
              <textarea
                value={selection.notes}
                onChange={e => setSelection(p => ({ ...p, notes: e.target.value }))}
                className="input resize-none"
                rows={3}
                placeholder="Any special requests or information for the business..."
              />
            </div>

            {!user && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                You need to <Link to="/login" className="font-medium underline">sign in</Link> to complete your booking.
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {submitting ? 'Confirming...' : (<><CheckCircle size={16} /> Confirm Booking</>)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, bold }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={15} />
        <span>{label}</span>
      </div>
      <span className={bold ? 'font-bold text-slate-800 text-base' : 'font-medium text-slate-700'}>{value}</span>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Calendar, Clock, CreditCard, Users, Star, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Calendar, title: 'Smart Scheduling',   desc: 'Real-time availability with conflict prevention' },
  { icon: Users,    title: 'Multi-Business',      desc: 'Each business gets their own independent dashboard' },
  { icon: CreditCard,title:'Flexible Payments',  desc: 'Accept online or in-person payments via Stripe' },
  { icon: Clock,    title: 'Automated Reminders', desc: 'Email & SMS notifications keep customers informed' },
  { icon: Star,     title: 'Analytics Dashboard', desc: 'Track revenue, performance, and booking trends' },
  { icon: Zap,      title: 'Role-Based Access',   desc: 'Admin, staff, and customer portals out of the box' },
];

const categories = ['Barbershop', 'Clinic', 'Salon', 'Workshop', 'Consultant', 'Spa & Gym'];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-800">SmartBook</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap size={14} /> SaaS Booking Platform for Service Businesses
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            The smartest way to<br />
            <span className="text-primary-600">manage bookings</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
            Automate scheduling, manage staff, accept payments, and grow your service business — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register?role=admin" className="btn-primary text-base px-8 py-3 flex items-center gap-2 justify-center">
              Start Free <ArrowRight size={18} />
            </Link>
            <Link to="/businesses" className="btn-secondary text-base px-8 py-3">
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Works for every type of service business</p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <span key={cat} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm text-slate-600 font-medium">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Everything you need</h2>
            <p className="text-slate-500 max-w-xl mx-auto">A complete booking platform for professional service businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-primary-100 mb-8">Set up your business and start accepting bookings in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Create Free Account
            </Link>
            <Link to="/businesses" className="border border-primary-400 text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors">
              Book a Service
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} SmartBook. Built with React & Node.js.</p>
      </footer>
    </div>
  );
}

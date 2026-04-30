import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';

const CATEGORIES = ['all', 'barbershop', 'clinic', 'salon', 'workshop', 'consultant', 'spa', 'gym', 'other'];

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search)               params.search = search;
        if (category !== 'all')   params.category = category;
        const res = await api.get('/businesses', { params });
        setBusinesses(res.data.businesses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchBusinesses, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/" className="text-sm text-primary-600 font-medium hover:underline mb-4 inline-block">← Back to Home</Link>
          <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">Find a Service</h1>
          <p className="text-slate-500 mb-8">Book appointments with local businesses instantly</p>

          <div className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-10 py-3 text-sm shadow-sm"
              placeholder="Search businesses..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                category === cat
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No businesses found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.map(biz => (
              <div key={biz._id} className="card hover:shadow-md transition-shadow overflow-hidden group">
                <div className="h-36 bg-gradient-to-br from-primary-100 to-blue-200 flex items-center justify-center">
                  {biz.logo ? (
                    <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
                  ) : (
                    <Calendar size={36} className="text-primary-400" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-slate-800">{biz.name}</h3>
                    <span className="badge-blue text-[11px] ml-2 shrink-0">{biz.category}</span>
                  </div>
                  {biz.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{biz.description}</p>
                  )}
                  {biz.address?.city && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                      <MapPin size={12} /> {biz.address.city}{biz.address.country ? `, ${biz.address.country}` : ''}
                    </p>
                  )}
                  <Link
                    to={`/book/${biz._id}`}
                    className="flex items-center justify-between text-sm font-medium text-primary-600 hover:text-primary-700 group"
                  >
                    Book Appointment
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

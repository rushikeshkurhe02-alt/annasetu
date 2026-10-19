import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PROVIDER_CATEGORIES } from '../utils/constants';
import { ProviderCategory } from '../types';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { formatDateOnly } from '../utils/rules';
import {
  Building2,
  MapPin,
  Utensils,
  Search,
  Filter,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const ProvidersDirectoryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');

  const providers = api.getProviders();
  const serveReports = api.getServeReports();

  // Extract localities
  const localities = Array.from(new Set(providers.map(p => p.locality.split(',')[0].trim())));

  // Calculate statistics per provider
  const getProviderStats = (providerId: string) => {
    const reports = serveReports.filter(r => r.providerId === providerId);
    const totalPlates = reports.reduce((acc, r) => acc + r.platesServed, 0) + 120; // past seed baseline
    const distinctNgos = new Set(reports.map(r => r.ngoId)).size || 2;
    const lastReport = reports[0];
    const lastDonationDate = lastReport ? formatDateOnly(lastReport.servedAt) : 'Recent';
    return { totalPlates, distinctNgos, lastDonationDate };
  };

  const filteredProviders = providers.filter(provider => {
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesLocality = selectedLocality === 'all' || provider.locality.includes(selectedLocality);
    const matchesSearch =
      provider.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.subType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLocality && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-[#1F6B3A]">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Institutional Donors Directory
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 mt-2">
            Surplus Food Providers
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Restaurants, function halls, banquet lawns, student messes, caterers, and hotels that pledge their daily consumable surplus to verified NGO networks.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#1F6B3A] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Categories ({providers.length})
            </button>
            {PROVIDER_CATEGORIES.map(cat => {
              const count = providers.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[#1F6B3A] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by donor name, type or locality..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F6B3A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Locality:</span>
            <select
              value={selectedLocality}
              onChange={e => setSelectedLocality(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6B3A] text-gray-700 font-medium"
            >
              <option value="all">All Pune Localities</option>
              {localities.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Provider Cards Grid */}
        {filteredProviders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-800">No food providers found</h3>
            <p className="text-xs text-gray-500 mt-1">Try clearing filters or changing your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map(provider => {
              const stats = getProviderStats(provider.id);
              const categoryMeta = PROVIDER_CATEGORIES.find(c => c.id === provider.category);

              return (
                <div
                  key={provider.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Top category & badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-[#1F6B3A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {categoryMeta?.label || 'Food Donor'}
                      </span>
                      <VerificationBadge type="verified" size="sm" />
                    </div>

                    <h3 className="font-heading font-bold text-lg text-gray-900 group-hover:text-[#1F6B3A] transition-colors line-clamp-1">
                      {provider.orgName}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {provider.subType}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{provider.locality}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{provider.typicalSurplusTime}</span>
                    </div>

                    {provider.fssaiNumber && (
                      <p className="text-[11px] text-gray-400 mt-2 font-mono">
                        FSSAI Reg: {provider.fssaiNumber}
                      </p>
                    )}
                  </div>

                  {/* Impact Stats Ribbon & View Profile Link */}
                  <div className="bg-[#FAF8F3] px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-base font-extrabold text-[#1F6B3A] font-heading">
                        {stats.totalPlates.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Plates Donated
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-base font-extrabold text-blue-700 font-heading">
                        {stats.distinctNgos}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Partner NGOs
                      </p>
                    </div>

                    <Link
                      to={`/providers/${provider.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1F6B3A] hover:underline"
                    >
                      <span>View Trust Feed</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

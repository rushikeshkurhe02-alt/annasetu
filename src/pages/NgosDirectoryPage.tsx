import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { NGO_FOCUS_AREAS } from '../utils/constants';
import { NgoFocusArea } from '../types';
import { VerificationBadge } from '../components/common/VerificationBadge';
import {
  UtensilsCrossed,
  Search,
  Filter,
  Truck,
  Users,
  MapPin,
  ChevronRight,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

export const NgosDirectoryPage: React.FC = () => {
  const [selectedFocus, setSelectedFocus] = useState<NgoFocusArea | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const ngos = api.getNgos();
  const places = api.getPlaces();
  const enlistments = api.getEnlistments();
  const serveReports = api.getServeReports();

  // All distinct operational areas
  const allAreas = Array.from(new Set(ngos.flatMap(n => n.areasOfOperation)));

  // Calculate NGO stats
  const getNgoStats = (ngoId: string) => {
    const reports = serveReports.filter(r => r.ngoId === ngoId);
    const totalPlates = reports.reduce((acc, r) => acc + r.platesServed, 0) + 160;
    const distinctPlacesCount = new Set(reports.map(r => r.placeId)).size || 2;
    const activeEnlists = enlistments.filter(e => e.ngoId === ngoId && e.status === 'active');
    const activePlaces = activeEnlists.map(e => places.find(p => p.id === e.placeId)).filter(Boolean);
    return { totalPlates, distinctPlacesCount, activePlaces };
  };

  const filteredNgos = ngos.filter(ngo => {
    const matchesFocus = selectedFocus === 'all' || ngo.focusAreas.includes(selectedFocus);
    const matchesArea = selectedArea === 'all' || ngo.areasOfOperation.includes(selectedArea);
    const matchesSearch =
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.areasOfOperation.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFocus && matchesArea && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-100 text-blue-800">
              <UtensilsCrossed className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Verified Distribution Volunteers
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 mt-2">
            Registered NGO Partners
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Non-profits, volunteer groups, and student squads equipped with insulated food-grade transport that collect surplus and immediately feed orphanages and shelters.
          </p>
        </div>

        {/* Focus Area Filter Chips */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedFocus('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFocus === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Causes ({ngos.length})
            </button>
            {NGO_FOCUS_AREAS.map(area => {
              const count = ngos.filter(n => n.focusAreas.includes(area.id)).length;
              return (
                <button
                  key={area.id}
                  onClick={() => setSelectedFocus(area.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedFocus === area.id
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{area.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedFocus === area.id ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Area Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search NGOs by name, contact, area..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Operating Area:</span>
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 font-medium"
            >
              <option value="all">All Operational Zones</option>
              {allAreas.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NGO Cards Grid */}
        {filteredNgos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-800">No NGOs found</h3>
            <p className="text-xs text-gray-500 mt-1">Try clearing filters or search queries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNgos.map(ngo => {
              const stats = getNgoStats(ngo.id);

              return (
                <div
                  key={ngo.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Top status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Reg: {ngo.regNo}
                      </span>
                      <VerificationBadge type="verified" size="sm" />
                    </div>

                    <h3 className="font-heading font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {ngo.name}
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Coordinator: {ngo.contact}
                    </p>

                    {/* Focus areas chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {ngo.focusAreas.map(fa => {
                        const meta = NGO_FOCUS_AREAS.find(f => f.id === fa);
                        return (
                          <span
                            key={fa}
                            className="text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md"
                          >
                            {meta?.label.split('&')[0].trim() || fa}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">Zones: {ngo.areasOfOperation.join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{ngo.hasVehicle ? (ngo.vehicleDetails || 'Dedicated delivery vehicle') : 'Volunteer 2-wheeler carriers'}</span>
                    </div>

                    {/* Active at places list */}
                    {stats.activePlaces.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                          Active at Places
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {stats.activePlaces.slice(0, 2).map(p => (
                            <span key={p!.id} className="text-[11px] text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 truncate max-w-[200px]">
                              {p!.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Impact Ribbon & Profile Link */}
                  <div className="bg-[#FAF8F3] px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-base font-extrabold text-blue-700 font-heading">
                        {stats.totalPlates.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Plates Served
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-base font-extrabold text-gray-800 font-heading">
                        {ngo.volunteersCount}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Volunteers
                      </p>
                    </div>

                    <Link
                      to={`/ngos/${ngo.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                    >
                      <span>View NGO</span>
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

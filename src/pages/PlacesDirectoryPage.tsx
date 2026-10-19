import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PLACE_TYPES } from '../utils/constants';
import { PlaceType, Place } from '../types';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import {
  HeartHandshake,
  MapPin,
  Users,
  PlusCircle,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  AlertTriangle,
  Building2
} from 'lucide-react';

export const PlacesDirectoryPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<PlaceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNeedsToday, setFilterNeedsToday] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { user } = useAuth();
  const { addToast, refreshKey } = useDemo();

  const places = api.getPlaces();
  const enlistments = api.getEnlistments();
  const ngos = api.getNgos();

  // New place form state
  const [newPlace, setNewPlace] = useState({
    name: '',
    type: 'orphanage' as PlaceType,
    address: '',
    locality: 'Pune',
    lat: 18.5204,
    lng: 73.8567,
    beneficiaries: 50,
    mealsPerDay: 2,
    needsToday: true,
    contactPerson: '',
    phone: '',
    description: ''
  });

  const handleCreatePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.name.trim() || !newPlace.address.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Details',
        message: 'Please provide facility name and address.'
      });
      return;
    }

    const created = api.createPlace({
      ...newPlace,
      createdByNgoId: user?.role === 'ngo' ? user.id : undefined,
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
    });

    addToast({
      type: 'info',
      title: 'Place Submitted (Pending Review)',
      message: `${created.name} is added with status "Pending review (demo)".`
    });

    setIsAddModalOpen(false);
    setNewPlace({
      name: '',
      type: 'orphanage',
      address: '',
      locality: 'Pune',
      lat: 18.5204,
      lng: 73.8567,
      beneficiaries: 50,
      mealsPerDay: 2,
      needsToday: true,
      contactPerson: '',
      phone: '',
      description: ''
    });
  };

  const filteredPlaces = places.filter(place => {
    const matchesType = selectedType === 'all' || place.type === selectedType;
    const matchesNeeds = !filterNeedsToday || place.needsToday;
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesNeeds && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                <HeartHandshake className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Beneficiary Registry
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 mt-2">
              Places in Need
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Verified orphanages, elderly homes (vridhashrams), night shelters, and informal labor settlements where food actually feeds people in need.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#1F6B3A] hover:bg-[#164e29] text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add a Care Facility</span>
          </button>
        </div>

        {/* Place Type Tabs */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Care Facilities ({places.length})
            </button>
            {PLACE_TYPES.map(type => {
              const count = places.filter(p => p.type === type.id).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedType === type.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{type.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedType === type.id ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search orphanages, shelters, old age homes..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 select-none">
            <input
              type="checkbox"
              checked={filterNeedsToday}
              onChange={e => setFilterNeedsToday(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <span>Show only "Needs food today"</span>
          </label>
        </div>

        {/* Places Grid */}
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <HeartHandshake className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-800">No care facilities found</h3>
            <p className="text-xs text-gray-500 mt-1">Try broadening your search or filter settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map(place => {
              const placeTypeMeta = PLACE_TYPES.find(t => t.id === place.type);
              const activeEnlistments = enlistments.filter(e => e.placeId === place.id && e.status === 'active');
              const activeNgos = activeEnlistments
                .map(e => ngos.find(n => n.id === e.ngoId))
                .filter(Boolean);

              return (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Top status & Type */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {placeTypeMeta?.label || 'Care Center'}
                      </span>
                      {place.reviewStatus === 'pending_review' ? (
                        <VerificationBadge type="pending" size="sm" />
                      ) : (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            place.needsToday
                              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {place.needsToday ? 'Needs food today' : 'Regularly served'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-lg text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {place.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{place.locality}</span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mt-3 leading-relaxed">
                      {place.description || place.address}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">Beneficiaries</span>
                        <span className="font-bold text-gray-800 font-heading text-sm">
                          {place.beneficiaries} residents
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">Daily Meals Needed</span>
                        <span className="font-bold text-gray-800 font-heading text-sm">
                          {place.mealsPerDay} meals / day
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NGO Stack and Link */}
                  <div className="bg-[#FAF8F3] px-6 py-3.5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">
                        Active NGO Partners ({activeNgos.length})
                      </span>
                      <div className="flex -space-x-2 overflow-hidden">
                        {activeNgos.length > 0 ? (
                          activeNgos.slice(0, 3).map((ngo, idx) => (
                            <div
                              key={ngo!.id}
                              title={ngo!.name}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center"
                            >
                              {ngo!.name.charAt(0)}
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No NGO enlisted yet</span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/places/${place.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline"
                    >
                      <span>View & Serve</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Place Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      Add a Place in Need
                    </h3>
                    <p className="text-xs text-gray-500">
                      Enlist an orphanage, shelter, or community settlement.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlace} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlace.name}
                    onChange={e => setNewPlace({ ...newPlace, name: e.target.value })}
                    placeholder="e.g. Bal Kalyan Ashram, Warje"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Facility Type *
                    </label>
                    <select
                      value={newPlace.type}
                      onChange={e => setNewPlace({ ...newPlace, type: e.target.value as PlaceType })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      {PLACE_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Locality / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlace.locality}
                      onChange={e => setNewPlace({ ...newPlace, locality: e.target.value })}
                      placeholder="e.g. Kothrud, Pune"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Full Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newPlace.address}
                    onChange={e => setNewPlace({ ...newPlace, address: e.target.value })}
                    placeholder="Complete address with landmark..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Beneficiaries (People) *
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={1000}
                      value={newPlace.beneficiaries}
                      onChange={e => setNewPlace({ ...newPlace, beneficiaries: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Meals Needed / Day
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      value={newPlace.mealsPerDay}
                      onChange={e => setNewPlace({ ...newPlace, mealsPerDay: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={newPlace.contactPerson}
                      onChange={e => setNewPlace({ ...newPlace, contactPerson: e.target.value })}
                      placeholder="Warden / Caretaker name"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newPlace.phone}
                      onChange={e => setNewPlace({ ...newPlace, phone: e.target.value })}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Special dietary or serving notes
                  </label>
                  <input
                    type="text"
                    value={newPlace.description}
                    onChange={e => setNewPlace({ ...newPlace, description: e.target.value })}
                    placeholder="e.g. Mild spices preferred for elderly, soft rotis..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong>Simulated Trust Check:</strong> Newly added care homes show as <em>"Pending review (demo)"</em> until verified by ground volunteer coordinators.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#1F6B3A] hover:bg-[#164e29] rounded-xl text-xs font-bold text-white shadow-sm"
                  >
                    Submit Place
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { api } from '../services/api';
import { CountdownRing } from '../components/common/CountdownRing';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LeafletMap } from '../components/common/LeafletMap';
import { PROVIDER_CATEGORIES } from '../utils/constants';
import { Offer, DistributionPlan, Place, Ngo, ProviderCategory } from '../types';
import { calculateOfferPriorityScore, formatDateTime, getPendingServeReports } from '../utils/rules';
import {
  UtensilsCrossed,
  MapPin,
  Clock,
  Car,
  CheckCircle2,
  AlertTriangle,
  Camera,
  HeartHandshake,
  KeyRound,
  Sparkles,
  Search,
  Filter,
  X,
  List,
  Map,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export const NgoDashboardPage: React.FC = () => {
  const { user, loginAsDemoNgo } = useAuth();
  const { simulatedTimeMs, addToast, refreshKey, triggerDataRefresh } = useDemo();

  const currentNgo = user?.role === 'ngo' ? (user.data as Ngo) : api.getNgos()[0];

  const [activeTab, setActiveTab] = useState<'live_feed' | 'my_requests' | 'pickups_today' | 'my_places'>('live_feed');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters for Live Feed
  const [filterCategory, setFilterCategory] = useState<ProviderCategory | 'all'>('all');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterMinPlates, setFilterMinPlates] = useState(0);

  // Modal States
  const [selectedOfferForPlan, setSelectedOfferForPlan] = useState<Offer | null>(null);
  const [selectedPlanForReport, setSelectedPlanForReport] = useState<{ plan: DistributionPlan; offer: Offer } | null>(null);

  // Distribution Plan Form State
  const [planForm, setPlanForm] = useState({
    placeId: '',
    beneficiaries: 50,
    meal: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'evening_snack',
    platesRequested: 50,
    collectorName: currentNgo.contact.split('(')[0].trim(),
    collectorPhone: currentNgo.phone,
    vehicle: currentNgo.vehicleDetails || 'Bolero Camper MH-12-QX-4012',
    pickupTime: '16:00',
    servingTime: '17:30',
    purposeNote: '',
    declarationHygiene: false,
    declarationReport: false
  });

  // Serve Report Form State
  const [reportForm, setReportForm] = useState({
    platesServed: 50,
    peopleFed: 50,
    servedAt: new Date().toISOString(),
    photos: [
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80'
    ] as string[],
    note: '',
    leftoverNote: 'Zero wastage recorded. All distributed completely.'
  });

  // Photo upload mock object URL generator
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setReportForm(prev => ({
        ...prev,
        photos: [...prev.photos.slice(0, 3), objectUrl]
      }));
      addToast({ type: 'info', title: 'Photo Attached', message: 'Proof photo loaded via Object URL preview.' });
    }
  };

  // Data queries
  const allOffers = api.getOffers();
  const allPlans = api.getPlans();
  const places = api.getPlaces();
  const providers = api.getProviders();
  const serveReports = api.getServeReports();
  const enlistments = api.getEnlistments();

  // Pending Serve Reports (Collected but not yet reported)
  const pendingServeReports = getPendingServeReports(allPlans, allOffers, serveReports, currentNgo.id);

  // Live Available Offers sorted by Priority Score (urgency + plates)
  const liveOffers = allOffers
    .filter(o => o.status === 'AVAILABLE' || o.status === 'REQUESTED')
    .filter(o => filterCategory === 'all' || providers.find(p => p.id === o.providerId)?.category === filterCategory)
    .filter(o => !filterVegOnly || o.isVeg)
    .filter(o => o.platesAvailable >= filterMinPlates)
    .sort((a, b) => {
      const scoreB = calculateOfferPriorityScore(b, simulatedTimeMs);
      const scoreA = calculateOfferPriorityScore(a, simulatedTimeMs);
      return scoreB - scoreA;
    });

  // My submitted plans
  const myPlans = allPlans.filter(p => p.ngoId === currentNgo.id);

  // Pickups today (confirmed or collected)
  const myPickups = allOffers.filter(o => o.allocatedNgoId === currentNgo.id && (o.status === 'CONFIRMED' || o.status === 'COLLECTED'));

  // My Places
  const myEnlistments = enlistments.filter(e => e.ngoId === currentNgo.id);
  const myEnlistedPlaces = myEnlistments.map(e => ({
    place: places.find(p => p.id === e.placeId),
    status: e.status
  })).filter(item => item.place !== undefined);

  // Open Plan Modal
  const openPlanModal = (offer: Offer) => {
    setSelectedOfferForPlan(offer);
    const defaultPlace = places[0];
    setPlanForm({
      placeId: defaultPlace ? defaultPlace.id : '',
      beneficiaries: Math.min(offer.platesAvailable, defaultPlace ? defaultPlace.beneficiaries : 50),
      meal: 'dinner',
      platesRequested: offer.platesAvailable,
      collectorName: currentNgo.contact.split('(')[0].trim(),
      collectorPhone: currentNgo.phone,
      vehicle: currentNgo.vehicleDetails || 'Bolero Camper MH-12-QX-4012',
      pickupTime: offer.pickupFrom || 'Within 45m',
      servingTime: 'Within 2h',
      purposeNote: '',
      declarationHygiene: false,
      declarationReport: false
    });
  };

  const handleSubmitDistributionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferForPlan) return;

    if (!planForm.declarationHygiene || !planForm.declarationReport) {
      addToast({
        type: 'error',
        title: 'Mandatory Declarations',
        message: 'You must check both hygiene and serve-report declaration checkboxes.'
      });
      return;
    }

    if (planForm.platesRequested > selectedOfferForPlan.platesAvailable) {
      addToast({
        type: 'error',
        title: 'Plate Limit Exceeded',
        message: `Only ${selectedOfferForPlan.platesAvailable} plates are available.`
      });
      return;
    }

    api.createDistributionPlan({
      offerId: selectedOfferForPlan.id,
      ngoId: currentNgo.id,
      placeId: planForm.placeId,
      beneficiaries: planForm.beneficiaries,
      meal: planForm.meal,
      platesRequested: planForm.platesRequested,
      collectorName: planForm.collectorName,
      collectorPhone: planForm.collectorPhone,
      vehicle: planForm.vehicle,
      pickupTime: planForm.pickupTime,
      servingTime: planForm.servingTime,
      purposeNote: planForm.purposeNote,
      declarationHygiene: planForm.declarationHygiene,
      declarationReport: planForm.declarationReport
    });

    triggerDataRefresh();
    addToast({
      type: 'success',
      title: 'Distribution Plan Submitted!',
      message: 'Provider notified. You are now enlisted as Planning at this care center.'
    });

    setSelectedOfferForPlan(null);
    setActiveTab('my_requests');
  };

  // Submit Serve Report
  const handleSubmitServeReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForReport) return;

    if (!reportForm.note.trim()) {
      addToast({ type: 'error', title: 'Note required', message: 'Please write a brief note on how distribution went.' });
      return;
    }

    api.createServeReport({
      planId: selectedPlanForReport.plan.id,
      offerId: selectedPlanForReport.offer.id,
      ngoId: currentNgo.id,
      providerId: selectedPlanForReport.offer.providerId,
      placeId: selectedPlanForReport.plan.placeId,
      platesServed: reportForm.platesServed,
      peopleFed: reportForm.peopleFed,
      servedAt: reportForm.servedAt,
      photos: reportForm.photos,
      note: reportForm.note,
      leftoverNote: reportForm.leftoverNote
    });

    triggerDataRefresh();
    addToast({
      type: 'success',
      title: 'Serve Report Published!',
      message: 'Verified report posted. Donor notified to confirm and thank you.'
    });

    setSelectedPlanForReport(null);
  };

  // Map markers for live feed
  const liveOfferMarkers = liveOffers.map(o => {
    const prov = providers.find(p => p.id === o.providerId);
    return {
      id: o.id,
      lat: prov?.lat || 18.5204,
      lng: prov?.lng || 73.8567,
      title: o.items,
      subtitle: `${prov?.orgName} • ${o.platesAvailable} Plates`,
      type: 'provider' as const,
      badge: `${o.platesAvailable} Plates Avail`,
      details: `Pickup: ${o.location}`
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* If user is not logged in as NGO, show demo prompt banner */}
        {user?.role !== 'ngo' && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-100 border border-blue-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-blue-800 shrink-0" />
              <p className="text-xs text-blue-900 font-medium">
                Viewing Demo NGO Dashboard for: <strong>{currentNgo.name}</strong>. You can claim surplus, submit distribution plans, and log reports.
              </p>
            </div>
            <button
              onClick={() => loginAsDemoNgo()}
              className="px-3 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors shrink-0"
            >
              Sign In as this NGO
            </button>
          </div>
        )}

        {/* Dashboard Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                NGO Relief Command
              </span>
              <VerificationBadge type="verified" size="sm" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 mt-1">
              {currentNgo.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Reg: {currentNgo.regNo} &bull; Zones: {currentNgo.areasOfOperation.join(', ')} &bull; {currentNgo.volunteersCount} Active Volunteers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('live_feed')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Browse Live Surplus ({liveOffers.length})</span>
            </button>
          </div>
        </div>

        {/* Highlighted Reminder for Pending Serve Reports */}
        {pendingServeReports.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50 border-2 border-purple-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-xl shrink-0 mt-0.5">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  <span>Serve Report Due ({pendingServeReports.length} Unreported Distribution)</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] bg-purple-200 text-purple-900 font-extrabold uppercase">
                    Action Required
                  </span>
                </h4>
                <p className="text-xs text-purple-900/80 mt-0.5">
                  You have collected surplus food that hasn't received a final photo serve report yet. Close the transparency loop so donors see their impact!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const item = pendingServeReports[0];
                setSelectedPlanForReport(item);
                setReportForm({
                  platesServed: item.plan.platesRequested,
                  peopleFed: item.plan.beneficiaries,
                  servedAt: new Date().toISOString(),
                  photos: [
                    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80'
                  ],
                  note: `Served freshly collected food at ${places.find(p => p.id === item.plan.placeId)?.name}. Residents appreciated the delicious meal.`,
                  leftoverNote: 'Zero wastage recorded.'
                });
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Post Report Now</span>
            </button>
          </div>
        )}

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Plates Distributed
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-heading mt-1">
              {(serveReports.filter(r => r.ngoId === currentNgo.id).reduce((a, b) => a + b.platesServed, 0) + 160).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">Verified by photo audits</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Places Enlisted
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-heading mt-1">
              {myEnlistedPlaces.length}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">Orphanages & shelters</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Pickups Today
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading mt-1">
              {myPickups.length}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">With mutual handover codes</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Reports Published
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-heading mt-1">
              {serveReports.filter(r => r.ngoId === currentNgo.id).length}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">Transparent proof loops</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab('live_feed')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'live_feed'
                ? 'border-b-2 border-amber-600 text-amber-800'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Live Offers Feed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {liveOffers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my_requests')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my_requests'
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>My Distribution Plans</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
              {myPlans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pickups_today')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pickups_today'
                ? 'border-b-2 border-emerald-600 text-emerald-800'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Pickups Today & Handover Code</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
              {myPickups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my_places')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my_places'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>My Care Places</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800">
              {myEnlistedPlaces.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Live Offers Feed with Filters & List/Map toggle */}
        {activeTab === 'live_feed' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div>
                  <span className="text-gray-500 font-medium mr-1.5">Category:</span>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value as ProviderCategory | 'all')}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold"
                  >
                    <option value="all">All Categories</option>
                    {PROVIDER_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={filterVegOnly}
                    onChange={e => setFilterVegOnly(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Pure Veg Only</span>
                </label>

                <div>
                  <span className="text-gray-500 font-medium mr-1.5">Min Plates:</span>
                  <select
                    value={filterMinPlates}
                    onChange={e => setFilterMinPlates(parseInt(e.target.value) || 0)}
                    className="px-2 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold"
                  >
                    <option value={0}>Any Quantity</option>
                    <option value={30}>30+ Plates</option>
                    <option value={60}>60+ Plates</option>
                    <option value={100}>100+ Plates</option>
                  </select>
                </div>
              </div>

              {/* List / Map View Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'map' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {/* List View */}
            {viewMode === 'list' ? (
              liveOffers.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                  <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-800 text-base">No matching surplus offers</h4>
                  <p className="text-xs text-gray-500 mt-1">Try resetting filters or use the Demo Sandbox to simulate a new offer.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveOffers.map(offer => {
                    const provider = providers.find(p => p.id === offer.providerId);
                    const priorityScore = calculateOfferPriorityScore(offer, simulatedTimeMs);

                    return (
                      <div
                        key={offer.id}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                  offer.isVeg ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                                }`}>
                                  {offer.isVeg ? 'Pure Veg' : 'Non-Veg'}
                                </span>
                                <span className="text-[11px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                  {offer.platesAvailable} Plates Available
                                </span>
                              </div>

                              <h3 className="font-heading font-bold text-lg text-gray-900 leading-snug">
                                {offer.items}
                              </h3>

                              <p className="text-xs text-gray-500 mt-0.5">
                                By <strong className="text-[#1F6B3A]">{provider?.orgName}</strong> ({provider?.locality})
                              </p>
                            </div>

                            {/* Live safe countdown */}
                            <CountdownRing createdAt={offer.createdAt} safeUntil={offer.safeUntil} />
                          </div>

                          {offer.eventDetails && (
                            <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/60 font-medium">
                              <strong>Event:</strong> {offer.eventDetails}
                            </p>
                          )}

                          <div className="text-xs text-gray-600 space-y-1 bg-[#FAF8F3] p-3 rounded-xl border border-gray-100">
                            <p><strong className="text-gray-800">Packaging:</strong> {offer.packing}</p>
                            <p><strong className="text-gray-800">Pickup window:</strong> {offer.pickupFrom} - {offer.pickupTo}</p>
                            <p><strong className="text-gray-800">Location:</strong> {offer.location}</p>
                          </div>
                        </div>

                        {/* Action footer */}
                        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400 font-medium">
                            Priority Score: <strong className="text-amber-700">{priorityScore}</strong>
                          </span>

                          <button
                            onClick={() => openPlanModal(offer)}
                            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform cursor-pointer"
                          >
                            <span>Submit Distribution Plan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Map View */
              <div className="space-y-4">
                <LeafletMap markers={liveOfferMarkers} height="480px" />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Distribution Plans */}
        {activeTab === 'my_requests' && (
          <div className="space-y-4">
            {myPlans.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
                <FileCheck2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-base">No distribution plans submitted yet</h4>
                <p className="text-xs text-gray-500 mt-1">Browse live offers to submit distribution requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPlans.map(plan => {
                  const offer = allOffers.find(o => o.id === plan.offerId);
                  const place = places.find(p => p.id === plan.placeId);
                  const provider = providers.find(p => p.id === offer?.providerId);

                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            plan.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : plan.status === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {plan.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            Submitted {formatDateTime(plan.createdAt)}
                          </span>
                        </div>

                        <h4 className="font-heading font-bold text-base text-gray-900">
                          {offer?.items} ({plan.platesRequested} plates)
                        </h4>

                        <p className="text-xs text-gray-600">
                          Donor: <strong className="text-[#1F6B3A]">{provider?.orgName}</strong> &rarr; Feeding:{' '}
                          <strong className="text-amber-800">{place?.name}</strong> ({plan.beneficiaries} residents)
                        </p>

                        {plan.declineReason && (
                          <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium">
                            Note: {plan.declineReason}
                          </p>
                        )}
                      </div>

                      {plan.status === 'confirmed' && (
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center shrink-0">
                          <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                            Your Handover Code
                          </span>
                          <span className="font-mono text-xl font-black text-emerald-900 tracking-wider">
                            {offer?.pickupCode}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pickups Today with 4-Digit Handover Code */}
        {activeTab === 'pickups_today' && (
          <div className="space-y-4">
            {myPickups.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
                <Car className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-base">No active pickups scheduled for today</h4>
                <p className="text-xs text-gray-500 mt-1">Once a provider confirms your request, the mutual pickup code appears here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myPickups.map(offer => {
                  const plan = myPlans.find(p => p.offerId === offer.id && p.status === 'confirmed');
                  const provider = providers.find(p => p.id === offer.providerId);
                  const place = places.find(p => p.id === plan?.placeId);

                  return (
                    <div
                      key={offer.id}
                      className="bg-white rounded-2xl border-2 border-emerald-300 p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-900">
                            {offer.status === 'COLLECTED' ? 'Food Collected • Transit / Serving' : 'Confirmed • Ready for Pickup Handover'}
                          </span>
                          <h3 className="font-heading font-bold text-xl text-gray-900 mt-2">
                            {offer.items}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Pickup at: <strong className="text-gray-900">{offer.location}</strong>
                          </p>
                        </div>

                        {/* Mutual 4-digit Handover Code banner */}
                        <div className="bg-gradient-to-br from-emerald-100 to-amber-100 border-2 border-emerald-400 p-4 rounded-2xl text-center min-w-[180px] shadow-xs">
                          <span className="text-[10px] text-emerald-900 font-extrabold uppercase tracking-wider block">
                            Show Code to Donor
                          </span>
                          <span className="font-mono text-3xl font-black text-gray-900 tracking-widest my-1 block">
                            {offer.pickupCode}
                          </span>
                          <span className="text-[10px] text-emerald-800 font-medium">4-Digit Verification</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF8F3] p-4 rounded-xl border border-gray-200">
                        <div>
                          <p><strong>Provider:</strong> {provider?.orgName} ({provider?.phone})</p>
                          <p><strong>Pickup Window:</strong> {offer.pickupFrom} - {offer.pickupTo}</p>
                          <p><strong>Vessel Rules:</strong> {offer.packing}</p>
                        </div>
                        <div>
                          <p><strong>Destination:</strong> {place?.name} ({place?.locality})</p>
                          <p><strong>Beneficiaries:</strong> {plan?.beneficiaries} residents</p>
                          <p><strong>Assigned Vehicle:</strong> {plan?.vehicle}</p>
                        </div>
                      </div>

                      {offer.status === 'COLLECTED' ? (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-purple-800 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            Collection confirmed! Please post your serve report once food is distributed.
                          </span>
                          <button
                            onClick={() => {
                              setSelectedPlanForReport({ plan: plan!, offer });
                              setReportForm({
                                platesServed: plan!.platesRequested,
                                peopleFed: plan!.beneficiaries,
                                servedAt: new Date().toISOString(),
                                photos: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'],
                                note: `Served hot meals to ${plan!.beneficiaries} residents at ${place?.name}. Smooth and joyful distribution.`,
                                leftoverNote: 'Zero wastage recorded.'
                              });
                            }}
                            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Post Serve Report & Proof
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>Driver / Volunteer: <strong>{plan?.collectorName} ({plan?.collectorPhone})</strong></span>
                          <span className="text-emerald-800 font-semibold">Have driver present code upon arrival</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: My Care Places */}
        {activeTab === 'my_places' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-gray-900">
                  Care Centers Managed by {currentNgo.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Facilities where your volunteers are actively or planned for meal distribution.
                </p>
              </div>

              <Link
                to="/places"
                className="px-4 py-2 bg-[#1F6B3A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#164e29]"
              >
                Browse & Enlist More Places
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEnlistedPlaces.map(({ place, status }) => (
                <div key={place!.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {status === 'active' ? 'Actively Serving' : 'Planning to Serve'}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{place!.beneficiaries} residents</span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-gray-900">{place!.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{place!.locality}</span>
                  </p>

                  <Link
                    to={`/places/${place!.id}`}
                    className="inline-block text-xs font-bold text-blue-700 hover:underline pt-2 border-t border-gray-100 w-full text-right"
                  >
                    View Facility Details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MANDATORY DISTRIBUTION PLAN MODAL */}
        {selectedOfferForPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      Submit Distribution Plan
                    </h3>
                    <p className="text-xs text-gray-500">
                      Surplus request is locked behind a strict accountability plan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOfferForPlan(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Offer Summary Ribbon */}
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block text-gray-900">{selectedOfferForPlan.items}</span>
                  <span>Available: {selectedOfferForPlan.platesAvailable} plates &bull; Safe until: {formatDateTime(selectedOfferForPlan.safeUntil)}</span>
                </div>
                <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                  {selectedOfferForPlan.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>

              <form onSubmit={handleSubmitDistributionPlan} className="space-y-4 pt-4">
                {/* Destination Place */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Destination Care Facility (Where will this food go?) *
                  </label>
                  <select
                    required
                    value={planForm.placeId}
                    onChange={e => {
                      const selPlace = places.find(p => p.id === e.target.value);
                      setPlanForm({
                        ...planForm,
                        placeId: e.target.value,
                        beneficiaries: selPlace ? selPlace.beneficiaries : planForm.beneficiaries
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    {places.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.locality}) &bull; {p.beneficiaries} residents
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Plates Requested (Max {selectedOfferForPlan.platesAvailable}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={selectedOfferForPlan.platesAvailable}
                      value={planForm.platesRequested}
                      onChange={e => setPlanForm({ ...planForm, platesRequested: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Meal Type *
                    </label>
                    <select
                      value={planForm.meal}
                      onChange={e => setPlanForm({ ...planForm, meal: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="evening_snack">Evening Snack</option>
                      <option value="breakfast">Breakfast</option>
                    </select>
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Collecting Volunteer / Driver *
                    </label>
                    <input
                      type="text"
                      required
                      value={planForm.collectorName}
                      onChange={e => setPlanForm({ ...planForm, collectorName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Driver Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={planForm.collectorPhone}
                      onChange={e => setPlanForm({ ...planForm, collectorPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Vehicle & Reg No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={planForm.vehicle}
                      onChange={e => setPlanForm({ ...planForm, vehicle: e.target.value })}
                      placeholder="e.g. Bolero Camper MH-12-QX-4012"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Planned Pickup & Serving Time *
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={planForm.pickupTime}
                        onChange={e => setPlanForm({ ...planForm, pickupTime: e.target.value })}
                        placeholder="Pickup: 16:00"
                        className="w-full px-2 py-2 text-xs rounded-lg border border-gray-300"
                      />
                      <input
                        type="text"
                        value={planForm.servingTime}
                        onChange={e => setPlanForm({ ...planForm, servingTime: e.target.value })}
                        placeholder="Serve: 17:30"
                        className="w-full px-2 py-2 text-xs rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Purpose / Event Note <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={planForm.purposeNote}
                    onChange={e => setPlanForm({ ...planForm, purposeNote: e.target.value })}
                    placeholder="e.g. Distributing to 50 children during evening study hall"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>

                {/* MANDATORY CHECKBOXES */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-900 font-medium">
                    <input
                      type="checkbox"
                      required
                      checked={planForm.declarationHygiene}
                      onChange={e => setPlanForm({ ...planForm, declarationHygiene: e.target.checked })}
                      className="mt-0.5 rounded text-[#1F6B3A] focus:ring-[#1F6B3A] w-4 h-4"
                    />
                    <span>We declare that we will transport and serve this food the same day under clean, hygienic conditions.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-900 font-medium">
                    <input
                      type="checkbox"
                      required
                      checked={planForm.declarationReport}
                      onChange={e => setPlanForm({ ...planForm, declarationReport: e.target.checked })}
                      className="mt-0.5 rounded text-[#1F6B3A] focus:ring-[#1F6B3A] w-4 h-4"
                    />
                    <span>We commit to posting a Serve Report with photos and actual count after distribution to close the loop.</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOfferForPlan(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!planForm.declarationHygiene || !planForm.declarationReport}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                      planForm.declarationHygiene && planForm.declarationReport
                        ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    Lock Plan & Request Surplus
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SERVE REPORT MODAL */}
        {selectedPlanForReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      Submit Verified Serve Report
                    </h3>
                    <p className="text-xs text-gray-500">
                      Required to close the accountability loop with the food donor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlanForReport(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitServeReport} className="space-y-4 pt-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                  <p><strong>Offer:</strong> {selectedPlanForReport.offer.items}</p>
                  <p><strong>Destination:</strong> {places.find(p => p.id === selectedPlanForReport.plan.placeId)?.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Plates Actually Served *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={reportForm.platesServed}
                      onChange={e => setReportForm({ ...reportForm, platesServed: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-bold text-purple-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      People Fed *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={reportForm.peopleFed}
                      onChange={e => setReportForm({ ...reportForm, peopleFed: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Serving Note & Field Story *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportForm.note}
                    onChange={e => setReportForm({ ...reportForm, note: e.target.value })}
                    placeholder="Describe how the serving took place, who was fed, reactions from residents..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Honest Leftover / Discarded Note
                  </label>
                  <input
                    type="text"
                    value={reportForm.leftoverNote}
                    onChange={e => setReportForm({ ...reportForm, leftoverNote: e.target.value })}
                    placeholder="e.g. Zero wastage, or 3 plates given to night watchman"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Proof Photos (1-4 Photos)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {reportForm.photos.map((url, i) => (
                      <div key={i} className="h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                        <img src={url} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-colors">
                    <UploadCloud className="w-4 h-4 text-gray-600" />
                    <span>Upload Local Photo (Object URL Preview)</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForReport(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 rounded-xl text-xs font-bold text-white shadow-sm"
                  >
                    Publish Verified Serve Report
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

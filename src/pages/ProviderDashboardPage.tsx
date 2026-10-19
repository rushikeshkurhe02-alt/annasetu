import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { api } from '../services/api';
import { CountdownRing } from '../components/common/CountdownRing';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LeafletMap } from '../components/common/LeafletMap';
import { FOOD_SAFE_WINDOW_HOURS, PROVIDER_CATEGORIES } from '../utils/constants';
import { Offer, DistributionPlan, ServeReport, Provider } from '../types';
import { formatDateTime } from '../utils/rules';
import {
  Utensils,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  KeyRound,
  FileText,
  Heart,
  Award,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Download,
  X,
  Camera,
  Car
} from 'lucide-react';

export const ProviderDashboardPage: React.FC = () => {
  const { user, loginAsDemoProvider } = useAuth();
  const { addToast, refreshKey, triggerDataRefresh } = useDemo();
  const navigate = useNavigate();

  // If not logged in as provider, allow easy 1-click login or view demo provider
  const currentProvider = user?.role === 'provider' ? (user.data as Provider) : api.getProviders()[0];

  const [activeTab, setActiveTab] = useState<'active' | 'requests' | 'in_progress' | 'served' | 'expired'>('active');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [pickupCodeInput, setPickupCodeInput] = useState<{ [offerId: string]: string }>({});

  // Offer Creation State
  const [newOffer, setNewOffer] = useState({
    items: '',
    foodType: 'wedding_banquet_buffet',
    platesTotal: 60,
    isVeg: true,
    packing: 'Packed in sanitized steel containers with tight clamps',
    pickupFrom: '15:30',
    pickupTo: '18:00',
    safeHours: 3.5,
    location: currentProvider.address + ', ' + currentProvider.locality,
    notes: '',
    eventDetails: ''
  });

  const offers = api.getOffers().filter(o => o.providerId === currentProvider.id);
  const allPlans = api.getPlans();
  const places = api.getPlaces();
  const ngos = api.getNgos();
  const serveReports = api.getServeReports().filter(r => r.providerId === currentProvider.id);

  // Filtered offer buckets
  const activeOffers = offers.filter(o => o.status === 'AVAILABLE');
  const requestedOfferIds = new Set(offers.filter(o => o.status === 'REQUESTED').map(o => o.id));
  const pendingRequests = allPlans.filter(p => requestedOfferIds.has(p.offerId) && p.status === 'submitted');
  const inProgressOffers = offers.filter(o => o.status === 'CONFIRMED' || o.status === 'COLLECTED');
  const servedOffers = offers.filter(o => o.status === 'SERVED');
  const expiredOffers = offers.filter(o => o.status === 'EXPIRED');

  // Stats
  const totalPlatesDonated = serveReports.reduce((acc, r) => acc + r.platesServed, 0) + 140;
  const distinctNgos = new Set(serveReports.map(r => r.ngoId)).size || 3;
  const distinctPlaces = new Set(serveReports.map(r => r.placeId)).size || 4;

  const handlePostOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.items.trim()) {
      addToast({ type: 'error', title: 'Items required', message: 'Please specify surplus food items.' });
      return;
    }

    const safeUntilDate = new Date(Date.now() + newOffer.safeHours * 3600 * 1000).toISOString();

    const created = api.createOffer({
      providerId: currentProvider.id,
      items: newOffer.items,
      foodType: newOffer.foodType,
      platesTotal: newOffer.platesTotal,
      platesAvailable: newOffer.platesTotal,
      isVeg: newOffer.isVeg,
      packing: newOffer.packing,
      pickupFrom: newOffer.pickupFrom,
      pickupTo: newOffer.pickupTo,
      safeUntil: safeUntilDate,
      location: newOffer.location,
      notes: newOffer.notes,
      eventDetails: newOffer.eventDetails
    });

    triggerDataRefresh();
    addToast({
      type: 'success',
      title: 'Surplus Offer Listed',
      message: `${created.platesTotal} plates listed! Alert dispatched to nearby registered NGOs.`
    });

    setIsPostModalOpen(false);
    setNewOffer({
      items: '',
      foodType: 'wedding_banquet_buffet',
      platesTotal: 60,
      isVeg: true,
      packing: 'Packed in sanitized steel containers with tight clamps',
      pickupFrom: '15:30',
      pickupTo: '18:00',
      safeHours: 3.5,
      location: currentProvider.address + ', ' + currentProvider.locality,
      notes: '',
      eventDetails: ''
    });
  };

  const handleConfirmPlan = (planId: string) => {
    const result = api.confirmDistributionPlan(planId);
    if (result) {
      triggerDataRefresh();
      addToast({
        type: 'success',
        title: 'Plan Confirmed & Allocated!',
        message: `4-Digit Mutual Handover Code generated: ${result.code}. First valid confirmed request locked.`
      });
      setActiveTab('in_progress');
    }
  };

  const handleDeclinePlan = (planId: string) => {
    api.declineDistributionPlan(planId, 'Capacity mismatch or pickup timing conflict');
    triggerDataRefresh();
    addToast({
      type: 'info',
      title: 'Request Declined',
      message: 'NGO notified politely. Offer remains open for other distribution proposals.'
    });
  };

  const handleVerifyHandover = (offerId: string) => {
    const code = pickupCodeInput[offerId] || '';
    if (!code) {
      addToast({ type: 'error', title: 'Code Required', message: 'Enter 4-digit code shown by NGO volunteer.' });
      return;
    }

    const result = api.markCollected(offerId, code);
    if (result.success) {
      addToast({ type: 'success', title: 'Pickup Verified!', message: result.message });
      triggerDataRefresh();
    } else {
      addToast({ type: 'error', title: 'Invalid Code', message: result.message });
    }
  };

  const handleThankReport = (reportId: string) => {
    api.thankAndConfirmServeReport(reportId);
    triggerDataRefresh();
    addToast({
      type: 'success',
      title: 'Report Verified with Thanks!',
      message: 'You acknowledged this distribution and awarded the "Provider verified this report" badge.'
    });
  };

  // Map markers for places reached
  const reachedPlaceIds = Array.from(new Set(serveReports.map(r => r.placeId)));
  const reachedPlaces = reachedPlaceIds.map(pid => places.find(p => p.id === pid)).filter(Boolean);
  const placesMapMarkers = reachedPlaces.map(p => ({
    id: p!.id,
    lat: p!.lat,
    lng: p!.lng,
    title: p!.name,
    subtitle: p!.locality,
    type: 'place' as const,
    badge: `${p!.beneficiaries} Fed`,
    linkUrl: `/places/${p!.id}`
  }));

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* If user is not logged in as provider, show demo prompt banner */}
        {user?.role !== 'provider' && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-800 shrink-0" />
              <p className="text-xs text-emerald-900 font-medium">
                Viewing Demo Dashboard for: <strong>{currentProvider.orgName}</strong>. You can take live actions below or sign in.
              </p>
            </div>
            <button
              onClick={() => loginAsDemoProvider()}
              className="px-3 py-1.5 bg-[#1F6B3A] text-white rounded-xl text-xs font-bold hover:bg-[#164e29] transition-colors shrink-0"
            >
              Sign In as this Provider
            </button>
          </div>
        )}

        {/* Dashboard Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1F6B3A] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Donor Command Center
              </span>
              <VerificationBadge type="verified" size="sm" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 mt-1">
              {currentProvider.orgName}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentProvider.address}, {currentProvider.locality}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/impact-report"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Download Impact Report (CSR)</span>
            </Link>

            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F6B3A] hover:bg-[#164e29] active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Surplus Offer</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Plates Donated
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1F6B3A] font-heading mt-1">
              {totalPlatesDonated.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">100% verified served</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Partner NGOs
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-heading mt-1">
              {distinctNgos}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">Active volunteer squads</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Care Centers Reached
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-heading mt-1">
              {distinctPlaces}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">Orphanages & shelters</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Serve Proof Reports
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-heading mt-1">
              {serveReports.length}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">With photos & numbers</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'border-b-2 border-[#1F6B3A] text-[#1F6B3A]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Active Offers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-[#1F6B3A]">
              {activeOffers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'border-b-2 border-amber-600 text-amber-800'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Incoming NGO Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('in_progress')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'in_progress'
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Allocated / Pickup Handover</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
              {inProgressOffers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('served')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'served'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Where Food Went (Reports)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800">
              {serveReports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expired')}
            className={`pb-3 px-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'expired'
                ? 'border-b-2 border-red-600 text-red-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Expired History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 text-gray-600">
              {expiredOffers.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Active Offers with Live Countdown Ring */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeOffers.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
                <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-base">No active surplus offers listed</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  When you have excess cooked food from a banquet, lunch service, or cafeteria prep, click below to list it.
                </p>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#1F6B3A] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Post Surplus Offer Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeOffers.map(offer => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            offer.isVeg ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            {offer.isVeg ? 'Pure Veg' : 'Non-Veg'} • {offer.platesAvailable} Plates Available
                          </span>
                          <h3 className="font-heading font-bold text-lg text-gray-900 mt-2">
                            {offer.items}
                          </h3>
                        </div>

                        {/* Live Countdown Ring */}
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

                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        Listed {formatDateTime(offer.createdAt)}
                      </span>
                      <button
                        onClick={() => {
                          api.simulateNgoRequest(offer.id);
                          triggerDataRefresh();
                          setActiveTab('requests');
                        }}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Simulate NGO Request &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requests with Full Distribution Plans */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-base">No pending NGO requests</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  When a verified NGO reviews an offer and commits a full distribution plan, it appears here for your authorization.
                </p>
                <button
                  onClick={() => {
                    api.simulateNgoRequest();
                    triggerDataRefresh();
                  }}
                  className="mt-4 px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Simulate an NGO Request Plan
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingRequests.map(plan => {
                  const offer = offers.find(o => o.id === plan.offerId);
                  const ngo = ngos.find(n => n.id === plan.ngoId);
                  const place = places.find(p => p.id === plan.placeId);

                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-3">
                        <div>
                          <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full uppercase tracking-wider">
                            Formal Distribution Plan Submitted
                          </span>
                          <h3 className="font-heading font-bold text-lg text-gray-900 mt-2">
                            Request from: {ngo?.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Surplus Item: <strong>{offer?.items}</strong> ({plan.platesRequested} plates requested)
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">Submitted at</span>
                          <span className="text-xs font-semibold text-gray-700">{formatDateTime(plan.createdAt)}</span>
                        </div>
                      </div>

                      {/* Detailed Distribution Plan Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF8F3] p-4 rounded-xl border border-gray-200/70 text-xs">
                        <div className="space-y-2">
                          <p>
                            <strong className="text-gray-900">Destination Facility:</strong>{' '}
                            <Link to={`/places/${place?.id}`} className="font-bold text-amber-800 hover:underline">
                              {place?.name}
                            </Link>{' '}
                            ({place?.locality})
                          </p>
                          <p>
                            <strong className="text-gray-900">Beneficiaries Expected:</strong>{' '}
                            <span className="font-bold text-emerald-800">{plan.beneficiaries} people</span> ({plan.meal.toUpperCase()})
                          </p>
                          {plan.purposeNote && (
                            <p className="italic text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                              "{plan.purposeNote}"
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p>
                            <strong className="text-gray-900">Pickup Lead Volunteer:</strong>{' '}
                            {plan.collectorName} ({plan.collectorPhone})
                          </p>
                          <p>
                            <strong className="text-gray-900">Transport:</strong>{' '}
                            <span className="font-mono text-gray-700">{plan.vehicle}</span>
                          </p>
                          <p>
                            <strong className="text-gray-900">Planned Pickup:</strong>{' '}
                            {plan.pickupTime} &bull; Serving at: {plan.servingTime}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-500 flex items-center gap-4">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hygiene declaration verified
                        </span>
                        <span className="flex items-center gap-1 text-purple-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Committed to post photo serve report
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleDeclinePlan(plan.id)}
                          className="px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleConfirmPlan(plan.id)}
                          className="px-5 py-2.5 bg-[#1F6B3A] hover:bg-[#164e29] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          Confirm & Allocate (Generates Handover Code)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Allocated / Pickup Handover (4-digit code verification) */}
        {activeTab === 'in_progress' && (
          <div className="space-y-6">
            {inProgressOffers.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-base">No pickups currently in progress</h4>
                <p className="text-xs text-gray-500 mt-1">
                  When you confirm an NGO request, the offer moves here for mutual code handover.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {inProgressOffers.map(offer => {
                  const plan = allPlans.find(p => p.offerId === offer.id && p.status === 'confirmed');
                  const ngo = ngos.find(n => n.id === offer.allocatedNgoId);
                  const place = places.find(p => p.id === plan?.placeId);

                  return (
                    <div
                      key={offer.id}
                      className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            offer.status === 'COLLECTED'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}>
                            {offer.status === 'COLLECTED' ? 'Collected • Awaiting NGO Serve Report' : 'Allocated • Pending Pickup Handover'}
                          </span>
                          <h3 className="font-heading font-bold text-lg text-gray-900 mt-2">
                            {offer.items} ({offer.platesTotal} plates)
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Allocated to NGO: <strong className="text-blue-800">{ngo?.name}</strong> &rarr; Destination: <strong className="text-amber-800">{place?.name}</strong>
                          </p>
                        </div>

                        {offer.status === 'CONFIRMED' && (
                          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-center">
                            <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                              Required Handover Code
                            </span>
                            <span className="font-mono text-xl font-black text-emerald-900 tracking-wider">
                              {offer.pickupCode}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Handover Code Verification Form */}
                      {offer.status === 'CONFIRMED' ? (
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <KeyRound className="w-6 h-6 text-emerald-700 shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">Verify Physical Handover</h4>
                              <p className="text-[11px] text-gray-600">
                                The collecting NGO driver/volunteer will present the 4-digit code. Enter it here to release and mark COLLECTED.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="e.g. 4829"
                              value={pickupCodeInput[offer.id] || ''}
                              onChange={e => setPickupCodeInput({ ...pickupCodeInput, [offer.id]: e.target.value })}
                              className="w-28 px-3 py-2 text-center font-mono font-bold text-base rounded-xl border border-gray-300 bg-white"
                            />
                            <button
                              onClick={() => handleVerifyHandover(offer.id)}
                              className="px-4 py-2 bg-[#1F6B3A] hover:bg-[#164e29] text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
                            >
                              Verify Handover
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                            <span>Food collected and in transit with <strong>{ngo?.name}</strong>. Awaiting their photo serve report.</span>
                          </div>
                          <button
                            onClick={() => {
                              api.createServeReport({
                                planId: plan?.id || 'demo-plan',
                                offerId: offer.id,
                                ngoId: ngo?.id || 'ngo-1',
                                providerId: currentProvider.id,
                                placeId: place?.id || 'place-1',
                                platesServed: offer.platesTotal,
                                peopleFed: place?.beneficiaries || 60,
                                servedAt: new Date().toISOString(),
                                photos: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'],
                                note: 'Hot meal distributed warmly to all residents. Clean portions and great gratitude.',
                                leftoverNote: 'Zero leftover.'
                              });
                              triggerDataRefresh();
                              setActiveTab('served');
                            }}
                            className="text-xs font-bold text-purple-800 hover:underline cursor-pointer shrink-0 ml-2"
                          >
                            Simulate NGO Submitting Serve Report &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Where Food Went (Serve Reports Gallery & Verification) */}
        {activeTab === 'served' && (
          <div className="space-y-6">
            {serveReports.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
                <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-base">No serve reports received yet</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Once partner NGOs distribute collected food, their photo reports will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serveReports.map(report => {
                  const place = places.find(p => p.id === report.placeId);
                  const ngo = ngos.find(n => n.id === report.ngoId);

                  return (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {report.photos && report.photos.length > 0 && (
                          <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
                            <img src={report.photos[0]} alt="Serve proof" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                              {report.platesServed} Plates Served
                            </div>
                            {report.providerConfirmed && (
                              <div className="absolute top-3 right-3">
                                <VerificationBadge type="provider_confirmed" size="sm" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Served by <strong className="text-blue-700">{ngo?.name}</strong></span>
                            <span>{formatDateTime(report.servedAt)}</span>
                          </div>

                          <h4 className="font-heading font-bold text-base text-gray-900">
                            Delivered to {place?.name}
                          </h4>

                          <p className="text-xs text-gray-700 italic bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                            "{report.note}"
                          </p>

                          {report.leftoverNote && (
                            <p className="text-[11px] text-gray-500">
                              <strong className="text-gray-700">Honest leftover audit:</strong> {report.leftoverNote}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Provider Acknowledgment Action */}
                      <div className="p-5 pt-0">
                        {report.providerConfirmed ? (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              You acknowledged and verified this serve report
                            </span>
                            <span className="text-emerald-700 text-[11px]">Badge Awarded</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">Review proof and acknowledge:</span>
                            <button
                              onClick={() => handleThankReport(report.id)}
                              className="px-4 py-2 bg-[#1F6B3A] hover:bg-[#164e29] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Heart className="w-3.5 h-3.5 fill-white" />
                              <span>Thank You & Confirm Report</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Expired Offers History */}
        {activeTab === 'expired' && (
          <div className="space-y-4">
            {expiredOffers.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-base">Zero food wastage recorded!</h4>
                <p className="text-xs text-gray-500 mt-1">
                  None of your listed offers expired without collection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expiredOffers.map(o => (
                  <div key={o.id} className="p-5 bg-white rounded-2xl border border-red-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                        Expired (Safe limit passed)
                      </span>
                      <span className="text-xs text-gray-400">{formatDateTime(o.createdAt)}</span>
                    </div>
                    <h4 className="font-heading font-bold text-base text-gray-800">{o.items}</h4>
                    <p className="text-xs text-gray-500">{o.platesTotal} plates &bull; Safe limit was: {formatDateTime(o.safeUntil)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Impact Map of Places Reached */}
        {placesMapMarkers.length > 0 && (
          <div className="mt-12 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                Regional Care Network Reached by {currentProvider.orgName}
              </h3>
              <p className="text-xs text-gray-500">
                All care homes, orphanages, and night shelters that have received wholesome meals from your kitchen.
              </p>
            </div>
            <LeafletMap markers={placesMapMarkers} height="320px" />
          </div>
        )}

        {/* Post Surplus Offer Modal */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-[#1F6B3A] rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      List Cooked Surplus Food
                    </h3>
                    <p className="text-xs text-gray-500">
                      Immediate alert sent to registered local NGOs with insulated vans.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostOffer} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Food Items Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOffer.items}
                    onChange={e => setNewOffer({ ...newOffer, items: e.target.value })}
                    placeholder="e.g. Veg Pulao, Paneer Gravy, Dal Tadka & 80 Rotis"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Food Category (FSSAI Safe Guide) *
                    </label>
                    <select
                      value={newOffer.foodType}
                      onChange={e => {
                        const val = e.target.value;
                        const defaultH = FOOD_SAFE_WINDOW_HOURS[val]?.hours || 3.5;
                        setNewOffer({ ...newOffer, foodType: val, safeHours: defaultH });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A] font-medium"
                    >
                      {Object.entries(FOOD_SAFE_WINDOW_HOURS).map(([key, info]) => (
                        <option key={key} value={key}>{info.description}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Approx Plates *
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1500}
                      value={newOffer.platesTotal}
                      onChange={e => setNewOffer({ ...newOffer, platesTotal: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A] font-bold"
                    />
                  </div>
                </div>

                {/* Safe window guidance notice */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>FSSAI Safe Window Guidance ({newOffer.safeHours} Hours Default)</span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    {FOOD_SAFE_WINDOW_HOURS[newOffer.foodType]?.advice}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Veg / Non-Veg
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewOffer({ ...newOffer, isVeg: true })}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                          newOffer.isVeg ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Pure Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewOffer({ ...newOffer, isVeg: false })}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                          !newOffer.isVeg ? 'bg-red-100 text-red-900 border-red-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Non-Veg
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Safe Until Duration (Hours)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={24}
                      value={newOffer.safeHours}
                      onChange={e => setNewOffer({ ...newOffer, safeHours: parseFloat(e.target.value) || 2 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Packaging & Vessel Exchange Info *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOffer.packing}
                    onChange={e => setNewOffer({ ...newOffer, packing: e.target.value })}
                    placeholder="e.g. In 3 stainless steel churns (NGO brings own vessels or return tomorrow)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Pickup Window
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newOffer.pickupFrom}
                        onChange={e => setNewOffer({ ...newOffer, pickupFrom: e.target.value })}
                        placeholder="From: 15:30"
                        className="w-full px-2 py-2 text-xs rounded-lg border border-gray-300"
                      />
                      <span className="text-xs text-gray-400">to</span>
                      <input
                        type="text"
                        value={newOffer.pickupTo}
                        onChange={e => setNewOffer({ ...newOffer, pickupTo: e.target.value })}
                        placeholder="To: 18:00"
                        className="w-full px-2 py-2 text-xs rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Event / Occasion Details <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newOffer.eventDetails}
                      onChange={e => setNewOffer({ ...newOffer, eventDetails: e.target.value })}
                      placeholder="e.g. Wedding lunch, Tech conclave"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Pickup Location / Loading Bay
                  </label>
                  <input
                    type="text"
                    value={newOffer.location}
                    onChange={e => setNewOffer({ ...newOffer, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#1F6B3A] hover:bg-[#164e29] rounded-xl text-xs font-bold text-white shadow-sm"
                  >
                    Publish Surplus Offer
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

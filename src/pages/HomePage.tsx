import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { api } from '../services/api';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LeafletMap } from '../components/common/LeafletMap';
import { formatDateTime } from '../utils/rules';
import {
  Utensils,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Users,
  CheckCircle,
  FileCheck2,
  Lock,
  Camera,
  ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoProvider, loginAsDemoNgo } = useAuth();
  const { t } = useLanguage();
  const { refreshKey } = useDemo();

  const providers = api.getProviders();
  const ngos = api.getNgos();
  const places = api.getPlaces();
  const serveReports = api.getServeReports();
  const offers = api.getOffers();

  // Aggregate live counters
  const totalPlatesServed = serveReports.reduce((acc, r) => acc + r.platesServed, 0) + 1250; // includes past cumulative
  const availableOffersCount = offers.filter(o => o.status === 'AVAILABLE').length;

  // Prepare map markers
  const mapMarkers = [
    ...providers.slice(0, 5).map(p => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      title: p.orgName,
      subtitle: p.locality,
      type: 'provider' as const,
      badge: p.subType,
      linkUrl: `/providers/${p.id}`,
      details: `Typical Surplus: ${p.typicalSurplusTime}`
    })),
    ...places.slice(0, 5).map(pl => ({
      id: pl.id,
      lat: pl.lat,
      lng: pl.lng,
      title: pl.name,
      subtitle: pl.locality,
      type: 'place' as const,
      badge: `${pl.beneficiaries} Residents`,
      linkUrl: `/places/${pl.id}`,
      details: `Needs: ${pl.mealsPerDay} meals/day`
    }))
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#E8E2D2]">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#1F6B3A_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Zero-Wastage Relationship & Verification Platform</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-gray-900 tracking-tight leading-[1.15]">
              Good food should reach a <span className="text-[#1F6B3A] underline decoration-amber-400 decoration-wavy decoration-2">plate</span>, not a dustbin.
            </h1>

            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              AnnaSetu creates a verified bridge between food providers (banquets, messes, caterers, hotels) and registered NGOs. 
              <strong> Not an ordering app</strong>: food is donated, collected through planned distribution, and verified with honest photo reports.
            </p>

            {/* Two Primary Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  loginAsDemoProvider();
                  navigate('/provider-dashboard');
                }}
                className="w-full sm:w-auto px-7 py-4 bg-[#1F6B3A] hover:bg-[#164e29] active:scale-98 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2.5 transition-all group cursor-pointer"
              >
                <Utensils className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
                <span>I am a Food Provider</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  loginAsDemoNgo();
                  navigate('/ngo-dashboard');
                }}
                className="w-full sm:w-auto px-7 py-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl font-bold text-base shadow-lg shadow-amber-900/15 flex items-center justify-center gap-2.5 transition-all group cursor-pointer"
              >
                <HeartHandshake className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
                <span>I am an NGO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                No middleman fees
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Mutual 4-digit handover codes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                FSSAI safe-window tracking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className="bg-white border-b border-[#E8E2D2] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-gray-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#1F6B3A] font-heading">
                {totalPlatesServed.toLocaleString('en-IN')}+
              </p>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">
                {t('platesRedirected')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-gray-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-heading">
                {ngos.length}
              </p>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">
                {t('activeNgos')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-gray-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
                {providers.length}
              </p>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">
                {t('activeProviders')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-gray-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-700 font-heading">
                {places.length}
              </p>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">
                {t('placesReached')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Trust Loop Row */}
      <section className="py-16 bg-[#F5EFE4]/60 border-b border-[#E8E2D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B3A] bg-emerald-100 px-3 py-1 rounded-full">
              Transparent Lifecycle
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-gray-900 mt-2">
              {t('howItWorks')}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Every surplus donation follows a locked 4-step accountability pipeline with complete visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#1F6B3A] font-extrabold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
                {t('step1Title')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {t('step1Desc')}
              </p>
              <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                ⏱ Live safe-window countdown
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
                {t('step2Title')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {t('step2Desc')}
              </p>
              <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 inline-block">
                📋 Mandatory distribution plan
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-extrabold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
                {t('step3Title')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {t('step3Desc')}
              </p>
              <div className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 inline-block">
                🔢 4-digit mutual pickup code
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-extrabold text-sm flex items-center justify-center mb-4">
                4
              </span>
              <h3 className="font-heading font-bold text-base text-gray-900 mb-2">
                {t('step4Title')}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {t('step4Desc')}
              </p>
              <div className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 inline-block">
                📸 Photo proof & provider thanks
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Serve Reports Carousel / Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-100 text-[#1F6B3A]">
                <Camera className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Verified Accountability Feed
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 mt-1">
              Where the food actually went
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Real reports posted by NGOs after serving meals, with photos and transparent numbers.
            </p>
          </div>

          <Link
            to="/providers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F6B3A] hover:underline"
          >
            <span>Explore all partner providers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serveReports.slice(0, 3).map(report => {
            const provider = providers.find(p => p.id === report.providerId);
            const ngo = ngos.find(n => n.id === report.ngoId);
            const place = places.find(pl => pl.id === report.placeId);

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Photo banner */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={report.photos[0]}
                    alt={`Distribution at ${place?.name || 'care center'}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-900 shadow-md">
                      {report.platesServed} Plates Served
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <VerificationBadge type="provider_confirmed" size="sm" />
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Destination Care Center
                      </span>
                      <h4 className="font-heading font-bold text-base text-gray-900 leading-snug">
                        {place?.name}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{place?.locality}</span>
                      </p>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed italic line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      "{report.note}"
                    </p>

                    {report.leftoverNote && (
                      <p className="text-[11px] text-gray-500">
                        <strong className="text-gray-700">Honest leftover audit:</strong> {report.leftoverNote}
                      </p>
                    )}
                  </div>

                  {/* Provider & NGO credits footer */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Donated By</span>
                      <Link
                        to={`/providers/${provider?.id}`}
                        className="font-bold text-[#1F6B3A] hover:underline truncate max-w-[140px] block"
                      >
                        {provider?.orgName}
                      </Link>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-medium">Served By</span>
                      <Link
                        to={`/ngos/${ngo?.id}`}
                        className="font-bold text-blue-700 hover:underline truncate max-w-[140px] block"
                      >
                        {ngo?.name}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Map Preview */}
      <section className="py-12 bg-white border-t border-[#E8E2D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B3A]">
                Live Pilot Network
              </span>
              <h3 className="font-heading font-bold text-2xl text-gray-900">
                Pune Regional Surplus & Care Node Map
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Explore real food providers (banquets, messes, hotels) mapped alongside care homes and active NGO volunteer hubs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/places"
                className="px-4 py-2 text-xs font-bold text-[#1F6B3A] bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                View Care Centers
              </Link>
              <Link
                to="/ngo-dashboard"
                className="px-4 py-2 text-xs font-bold text-white bg-[#1F6B3A] rounded-xl hover:bg-[#164e29] transition-colors"
              >
                View Live Offers ({availableOffersCount})
              </Link>
            </div>
          </div>

          <LeafletMap markers={mapMarkers} height="400px" />
        </div>
      </section>

      {/* Trust & Transparency Principles */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1F6B3A] to-[#154d29] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
              Platform Philosophy
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl mt-2 leading-tight">
              Why AnnaSetu is different from conventional food apps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="space-y-1.5">
                <h4 className="font-bold text-base text-amber-200 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  No Star-Rating Wars
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Instead of gamified stars or punitive reviews, providers simply acknowledge serve reports with "Thank you" and "I confirm this looks right". Mutual dignity is paramount.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-base text-amber-200 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  FSSAI Safe-Window Guard
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Hot cooked food loses safety over ambient hours. Our live countdown rings enforce urgent collection before food degrades.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-base text-amber-200 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-300" />
                  Closed-Loop Photo Proof
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  NGOs must upload photographic proof of distribution. The donor gets to see genuine smiles, clean portioning, and honest leftover accounting.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-base text-amber-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-300" />
                  CSR & Impact Audit Ready
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Every plate redirected is recorded for corporate ESG reporting, carbon offset metrics, and institutional tax compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

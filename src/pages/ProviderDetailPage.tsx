import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LeafletMap } from '../components/common/LeafletMap';
import { formatDateOnly, formatDateTime } from '../utils/rules';
import { PROVIDER_CATEGORIES } from '../utils/constants';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  ArrowLeft,
  Camera,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

export const ProviderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const provider = api.getProviderById(id || '');

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Food Provider not found</h2>
        <Link to="/providers" className="text-sm font-semibold text-[#1F6B3A] underline mt-3 inline-block">
          &larr; Back to Food Providers Directory
        </Link>
      </div>
    );
  }

  const categoryMeta = PROVIDER_CATEGORIES.find(c => c.id === provider.category);
  const serveReports = api.getServeReports().filter(r => r.providerId === provider.id);
  const places = api.getPlaces();
  const ngos = api.getNgos();

  const totalPlatesDonated = serveReports.reduce((acc, r) => acc + r.platesServed, 0) + 140;
  const distinctNgos = new Set(serveReports.map(r => r.ngoId)).size || 3;
  const distinctPlaces = new Set(serveReports.map(r => r.placeId)).size || 4;

  const mapMarker = [
    {
      id: provider.id,
      lat: provider.lat,
      lng: provider.lng,
      title: provider.orgName,
      subtitle: provider.address,
      type: 'provider' as const,
      badge: categoryMeta?.label || 'Provider'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/providers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Providers Directory</span>
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#1F6B3A] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  {categoryMeta?.label}
                </span>
                <VerificationBadge type="verified" />
                {provider.fssaiNumber && (
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                    FSSAI #{provider.fssaiNumber}
                  </span>
                )}
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
                {provider.orgName}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {provider.about || 'Pledged to ensure zero food waste by routing clean daily surplus to verified local NGO networks.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{provider.address}, {provider.locality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Surplus Time: {provider.typicalSurplusTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{provider.contact} ({provider.phone})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{provider.email}</span>
                </div>
              </div>
            </div>

            {/* Impact Metric Pillar */}
            <div className="bg-[#FAF8F3] border border-gray-200 rounded-2xl p-5 min-w-[220px] text-center space-y-4">
              <div>
                <p className="text-3xl font-extrabold text-[#1F6B3A] font-heading">
                  {totalPlatesDonated.toLocaleString('en-IN')}
                </p>
                <p className="text-xs uppercase font-semibold text-gray-500 mt-0.5">
                  Total Plates Donated
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                <div>
                  <p className="text-lg font-bold text-gray-800 font-heading">{distinctNgos}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Partner NGOs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-700 font-heading">{distinctPlaces}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Care Centers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns: Where Your Food Went (Public Feed) + Location Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#1F6B3A]" />
                  Where your food went
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified distribution reports posted by NGOs after collecting and serving food from {provider.orgName}.
                </p>
              </div>
            </div>

            {serveReports.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">No serve reports posted yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Once partner NGOs distribute upcoming surplus batches, photo proof reports will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {serveReports.map(report => {
                  const place = places.find(p => p.id === report.placeId);
                  const ngo = ngos.find(n => n.id === report.ngoId);

                  return (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden"
                    >
                      {/* Top banner info */}
                      <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                            NGO
                          </div>
                          <div>
                            <Link to={`/ngos/${ngo?.id}`} className="text-xs font-bold text-gray-900 hover:text-blue-700">
                              {ngo?.name}
                            </Link>
                            <span className="text-[11px] text-gray-400 block">
                              Reported on {formatDateTime(report.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#1F6B3A]">
                            {report.platesServed} Plates Served
                          </span>
                          <VerificationBadge type="provider_confirmed" size="sm" />
                        </div>
                      </div>

                      {/* Content & Photos */}
                      <div className="p-5 space-y-4">
                        <div className="bg-[#FAF8F3] p-3.5 rounded-xl border border-gray-200/60">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span>Destination Care Facility</span>
                          </div>
                          <Link to={`/places/${place?.id}`} className="font-bold text-sm text-gray-900 hover:text-[#1F6B3A]">
                            {place?.name}
                          </Link>
                          <span className="text-xs text-gray-500 ml-2">({place?.locality})</span>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                          "{report.note}"
                        </p>

                        {report.leftoverNote && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <span className="font-semibold text-gray-800">Honest Leftover & Vessel Audit:</span> {report.leftoverNote}
                          </div>
                        )}

                        {/* Photo gallery */}
                        {report.photos && report.photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {report.photos.map((photoUrl, i) => (
                              <div key={i} className="relative h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                  src={photoUrl}
                                  alt="Serving proof"
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Location & Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h4 className="font-heading font-bold text-sm text-gray-900">
                Pickup Loading Location
              </h4>
              <LeafletMap markers={mapMarker} center={[provider.lat, provider.lng]} zoom={14} height="240px" selectedMarkerId={provider.id} />
              <p className="text-xs text-gray-500">
                {provider.address}, {provider.locality}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <h4 className="font-heading font-bold text-sm text-emerald-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Verified Donor Commitment
              </h4>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                {provider.orgName} follows hygienic food-handling guidelines and hands over surplus inside safe consumable windows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

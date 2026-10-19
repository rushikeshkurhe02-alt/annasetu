import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { NGO_FOCUS_AREAS } from '../utils/constants';
import { formatDateTime } from '../utils/rules';
import {
  UtensilsCrossed,
  MapPin,
  Truck,
  Users,
  Phone,
  Mail,
  ArrowLeft,
  Camera,
  HeartHandshake,
  Building2,
  Calendar
} from 'lucide-react';

export const NgoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ngo = api.getNgoById(id || '');

  if (!ngo) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">NGO not found</h2>
        <Link to="/ngos" className="text-sm font-semibold text-blue-700 underline mt-3 inline-block">
          &larr; Back to NGO Directory
        </Link>
      </div>
    );
  }

  const places = api.getPlaces();
  const providers = api.getProviders();
  const enlistments = api.getEnlistments().filter(e => e.ngoId === ngo.id);
  const serveReports = api.getServeReports().filter(r => r.ngoId === ngo.id);

  const activeEnlists = enlistments.filter(e => e.status === 'active');
  const planningEnlists = enlistments.filter(e => e.status === 'planning');

  const activePlaces = activeEnlists.map(e => places.find(p => p.id === e.placeId)).filter(Boolean);
  const planningPlaces = planningEnlists.map(e => places.find(p => p.id === e.placeId)).filter(Boolean);

  const totalPlatesServed = serveReports.reduce((acc, r) => acc + r.platesServed, 0) + 160;
  const partnerProviderIds = Array.from(new Set(serveReports.map(r => r.providerId)));
  const partnerProviders = partnerProviderIds.map(pid => providers.find(p => p.id === pid)).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/ngos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to NGOs Directory</span>
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  Reg #{ngo.regNo}
                </span>
                <VerificationBadge type="verified" />
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
                {ngo.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {ngo.about || 'Dedicated humanitarian volunteer squad active across Pune, ensuring surplus cooked food reaches shelter residents hygienically.'}
              </p>

              {/* Focus tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ngo.focusAreas.map(fa => {
                  const meta = NGO_FOCUS_AREAS.find(f => f.id === fa);
                  return (
                    <span key={fa} className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-lg">
                      {meta?.label || fa}
                    </span>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Zones: {ngo.areasOfOperation.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transport: {ngo.vehicleDetails || 'Dedicated insulated vehicle'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Contact: {ngo.contact} ({ngo.phone})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{ngo.email}</span>
                </div>
              </div>
            </div>

            {/* Impact Metric Pillar */}
            <div className="bg-[#FAF8F3] border border-gray-200 rounded-2xl p-5 min-w-[220px] text-center space-y-4">
              <div>
                <p className="text-3xl font-extrabold text-blue-700 font-heading">
                  {totalPlatesServed.toLocaleString('en-IN')}
                </p>
                <p className="text-xs uppercase font-semibold text-gray-500 mt-0.5">
                  Total Plates Served
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                <div>
                  <p className="text-lg font-bold text-gray-800 font-heading">{ngo.volunteersCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Volunteers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-700 font-heading">{activePlaces.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Active Places</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed: NGO's Serve Reports */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-700" />
                Verified Serve Reports by {ngo.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Authentic field documentation, food quality reviews, and photo proof submitted after meal handovers.
              </p>
            </div>

            {serveReports.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                <UtensilsCrossed className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">No serve reports recorded yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Once this NGO completes surplus distributions, their serve logs and proof photos will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {serveReports.map(report => {
                  const place = places.find(p => p.id === report.placeId);
                  const provider = providers.find(p => p.id === report.providerId);

                  return (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden"
                    >
                      <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">
                            Delivered to: <Link to={`/places/${place?.id}`} className="text-amber-800 hover:underline">{place?.name}</Link>
                          </span>
                          <span className="text-[11px] text-gray-400">
                            • {formatDateTime(report.servedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                            {report.platesServed} Plates Served
                          </span>
                          <VerificationBadge type="provider_confirmed" size="sm" />
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                          "{report.note}"
                        </p>

                        {report.leftoverNote && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <strong className="text-gray-700">Audit note:</strong> {report.leftoverNote}
                          </p>
                        )}

                        {report.photos && report.photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {report.photos.map((url, i) => (
                              <div key={i} className="h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={url} alt="Distribution report" className="w-full h-full object-cover" loading="lazy" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                          <span>Donated by: <strong className="text-[#1F6B3A]">{provider?.orgName}</strong></span>
                          <span>People Fed: <strong className="text-gray-900">{report.peopleFed}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Places Enlisted & Partner Providers */}
          <div className="space-y-6">
            {/* Active & Planning Places */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                Places Supported by this NGO
              </h4>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-1.5">
                    Actively Serving ({activePlaces.length})
                  </span>
                  {activePlaces.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">None active</p>
                  ) : (
                    <div className="space-y-1.5">
                      {activePlaces.map(p => (
                        <Link
                          key={p!.id}
                          to={`/places/${p!.id}`}
                          className="p-2.5 bg-emerald-50/60 hover:bg-emerald-100/70 rounded-xl border border-emerald-100 flex items-center justify-between transition-colors block"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900">{p!.name}</p>
                            <p className="text-[10px] text-gray-500">{p!.beneficiaries} residents</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {planningPlaces.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1.5">
                      Planning to Serve ({planningPlaces.length})
                    </span>
                    <div className="space-y-1.5">
                      {planningPlaces.map(p => (
                        <Link
                          key={p!.id}
                          to={`/places/${p!.id}`}
                          className="p-2.5 bg-amber-50/60 hover:bg-amber-100/70 rounded-xl border border-amber-100 flex items-center justify-between transition-colors block"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900">{p!.name}</p>
                            <p className="text-[10px] text-gray-500">{p!.locality}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Partner Providers */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1F6B3A]" />
                Collaborating Food Providers
              </h4>
              {partnerProviders.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No historical donor partnerships logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {partnerProviders.map(p => (
                    <Link
                      key={p!.id}
                      to={`/providers/${p!.id}`}
                      className="p-2.5 bg-[#FAF8F3] hover:bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-between transition-colors block"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900">{p!.orgName}</p>
                        <p className="text-[10px] text-gray-500">{p!.locality}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

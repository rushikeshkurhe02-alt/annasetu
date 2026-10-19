import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PLACE_TYPES } from '../utils/constants';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LeafletMap } from '../components/common/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { formatDateTime } from '../utils/rules';
import {
  MapPin,
  Users,
  Utensils,
  ArrowLeft,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Phone,
  Calendar,
  Camera,
  Plus
} from 'lucide-react';

export const PlaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast, refreshKey, triggerDataRefresh } = useDemo();

  const place = api.getPlaceById(id || '');

  if (!place) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Place in Need not found</h2>
        <Link to="/places" className="text-sm font-semibold text-[#1F6B3A] underline mt-3 inline-block">
          &larr; Back to Places Directory
        </Link>
      </div>
    );
  }

  const placeTypeMeta = PLACE_TYPES.find(t => t.id === place.type);
  const enlistments = api.getEnlistments().filter(e => e.placeId === place.id);
  const ngos = api.getNgos();
  const serveReports = api.getServeReports().filter(r => r.placeId === place.id);
  const providers = api.getProviders();

  const activeEnlistments = enlistments.filter(e => e.status === 'active');
  const planningEnlistments = enlistments.filter(e => e.status === 'planning');

  const activeNgos = activeEnlistments.map(e => ngos.find(n => n.id === e.ngoId)).filter(Boolean);
  const planningNgos = planningEnlistments.map(e => ngos.find(n => n.id === e.ngoId)).filter(Boolean);

  // Check if current logged-in NGO is already enlisted
  const currentNgoEnlistment = user?.role === 'ngo' ? enlistments.find(e => e.ngoId === user.id) : null;

  const handleEnlist = (status: 'planning' | 'active') => {
    if (!user || user.role !== 'ngo') {
      addToast({
        type: 'warning',
        title: 'NGO Login Required',
        message: 'Please sign in or use the 1-tap demo NGO account to enlist for distribution.'
      });
      return;
    }

    api.enlistNgoAtPlace(place.id, user.id, status);
    triggerDataRefresh();
    addToast({
      type: 'success',
      title: status === 'active' ? 'Serving Regularly' : 'Distribution Planned',
      message: `Your NGO (${user.name}) is now listed as ${status === 'active' ? 'actively serving' : 'planning to serve'} at ${place.name}.`
    });
  };

  const mapMarker = [
    {
      id: place.id,
      lat: place.lat,
      lng: place.lng,
      title: place.name,
      subtitle: place.address,
      type: 'place' as const,
      badge: `${place.beneficiaries} Beneficiaries`
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/places"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Places in Need</span>
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg border border-amber-200">
                  {placeTypeMeta?.label}
                </span>
                {place.reviewStatus === 'pending_review' ? (
                  <VerificationBadge type="pending" />
                ) : (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    place.needsToday
                      ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {place.needsToday ? 'Needs food today' : 'Regularly served'}
                  </span>
                )}
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
                {place.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {place.description || 'Caring facility dedicated to providing shelter, education and nutrition to community members in need.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{place.address}, {place.locality}</span>
                </div>
                {place.contactPerson && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Contact: {place.contactPerson} ({place.phone || 'Verified on file'})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Need Metric Pillar */}
            <div className="bg-[#FAF8F3] border border-gray-200 rounded-2xl p-5 min-w-[220px] text-center space-y-4">
              <div>
                <p className="text-3xl font-extrabold text-amber-700 font-heading">
                  {place.beneficiaries}
                </p>
                <p className="text-xs uppercase font-semibold text-gray-500 mt-0.5">
                  Residents / People
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-gray-800 font-heading">{place.mealsPerDay} Meals / Day</p>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Requirement</p>
              </div>
            </div>
          </div>

          {/* NGO Enlistment Actions */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">
              {currentNgoEnlistment ? (
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your NGO is enlisted as: <strong>{currentNgoEnlistment.status.toUpperCase()}</strong>
                </span>
              ) : (
                <span>Are you an NGO operating in this locality? Enlist your organization to coordinate meal schedules:</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEnlist('planning')}
                className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
              >
                I am going to serve here
              </button>
              <button
                onClick={() => handleEnlist('active')}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#1F6B3A] hover:bg-[#164e29] rounded-xl transition-colors shadow-xs"
              >
                We are serving here regularly
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed: Latest Serve Reports at this place */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" />
                Latest Verified Serve Reports
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Proof of hot meals delivered and served at {place.name}.
              </p>
            </div>

            {serveReports.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                <HeartHandshake className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">No serve reports logged yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  When an NGO collects food from an active offer and brings it here, their photos and counts will be published below.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {serveReports.map(report => {
                  const provider = providers.find(p => p.id === report.providerId);
                  const ngo = ngos.find(n => n.id === report.ngoId);

                  return (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden"
                    >
                      <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                            {ngo?.name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatDateTime(report.servedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
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
                            <strong className="text-gray-700">Leftover note:</strong> {report.leftoverNote}
                          </p>
                        )}

                        {report.photos && report.photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {report.photos.map((url, i) => (
                              <div key={i} className="h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={url} alt="Serve proof" className="w-full h-full object-cover" loading="lazy" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                          <span>Donated by: <strong className="text-[#1F6B3A]">{provider?.orgName}</strong></span>
                          <span>Fed: <strong className="text-gray-900">{report.peopleFed} people</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Map and NGO Enlistments */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-heading font-bold text-sm text-gray-900">
                Care Center Location
              </h4>
              <LeafletMap markers={mapMarker} center={[place.lat, place.lng]} zoom={14} height="220px" selectedMarkerId={place.id} />
              <p className="text-xs text-gray-500">
                {place.address}, {place.locality}
              </p>
            </div>

            {/* Currently Serving NGOs */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                Currently Serving Regularly ({activeNgos.length})
              </h4>
              {activeNgos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No NGOs actively enlisted yet.</p>
              ) : (
                <div className="space-y-2">
                  {activeNgos.map(ngo => (
                    <div key={ngo!.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <Link to={`/ngos/${ngo!.id}`} className="text-xs font-bold text-gray-900 hover:text-emerald-800">
                          {ngo!.name}
                        </Link>
                        <p className="text-[10px] text-gray-500">{ngo!.areasOfOperation.join(', ')}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase px-2 py-0.5 rounded bg-emerald-100">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Planning to Serve NGOs */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Planning to Serve ({planningNgos.length})
              </h4>
              {planningNgos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No upcoming distribution schedules logged.</p>
              ) : (
                <div className="space-y-2">
                  {planningNgos.map(ngo => (
                    <div key={ngo!.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between">
                      <div>
                        <Link to={`/ngos/${ngo!.id}`} className="text-xs font-bold text-gray-900 hover:text-amber-800">
                          {ngo!.name}
                        </Link>
                        <p className="text-[10px] text-gray-500">{ngo!.volunteersCount} volunteers</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase px-2 py-0.5 rounded bg-amber-100">
                        Planning
                      </span>
                    </div>
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

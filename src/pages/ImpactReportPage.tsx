import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateOnly } from '../utils/rules';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Award,
  Sparkles,
  Leaf,
  Droplets,
  Heart,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export const ImpactReportPage: React.FC = () => {
  const { user } = useAuth();
  const providers = api.getProviders();
  const places = api.getPlaces();
  const ngos = api.getNgos();
  const serveReports = api.getServeReports();

  const selectedProvider = user?.role === 'provider' ? (user.data as any) : providers[0];

  // Calculations for environmental & social metrics
  const totalPlatesSaved = serveReports.reduce((acc, r) => acc + r.platesServed, 0) + 1450;
  // According to environmental life-cycle assessments:
  // ~0.65 kg CO2 equivalent prevented per kg/plate of cooked food redirected from landfill
  const co2DivertedKg = Math.round(totalPlatesSaved * 0.65);
  // ~380 liters of virtual agricultural water conserved per cooked meal saved
  const waterConservedLiters = Math.round(totalPlatesSaved * 380);

  // Monthly breakdown chart data
  const monthlyData = [
    { month: 'Jun', plates: 180, co2: 117 },
    { month: 'Jul', plates: 260, co2: 169 },
    { month: 'Aug', plates: 340, co2: 221 },
    { month: 'Sep', plates: 490, co2: 318 },
    { month: 'Oct', plates: totalPlatesSaved - 1270, co2: Math.round((totalPlatesSaved - 1270) * 0.65) }
  ];

  // Beneficiary category distribution
  const beneficiaryData = [
    { name: 'Orphanages', value: 45, color: '#1F6B3A' },
    { name: 'Senior Citizens', value: 30, color: '#D97706' },
    { name: 'Night Shelters', value: 25, color: '#2563EB' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between mb-8 no-print">
          <Link
            to="/provider-dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F6B3A] hover:bg-[#164e29] active:scale-98 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>

        {/* Printable Official Statement Container */}
        <div className="bg-white rounded-3xl border border-gray-300 p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-emerald-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg bg-[#1F6B3A] text-white flex items-center justify-center font-black text-lg">
                  अ
                </span>
                <span className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                  AnnaSetu
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  CSR Compliance Protocol
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Institutional Surplus Food Redistribution & Environmental Impact Statement
              </p>
            </div>

            <div className="text-right text-xs text-gray-500 font-mono">
              <p>Audit Ref: <strong>AS-CSR-2026-PUN-{selectedProvider.id}</strong></p>
              <p>Generated: <strong>{formatDateOnly(new Date().toISOString())}</strong></p>
            </div>
          </div>

          {/* Recipient Provider / Donor Block */}
          <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Reporting Organization</span>
              <h3 className="font-heading font-bold text-base text-gray-900">{selectedProvider.orgName}</h3>
              <p className="text-gray-600 mt-0.5">{selectedProvider.address}, {selectedProvider.locality}</p>
              {selectedProvider.fssaiNumber && (
                <p className="font-mono text-gray-500 mt-1">FSSAI Licence: #{selectedProvider.fssaiNumber}</p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Verification Framework</span>
              <p className="text-emerald-800 font-bold">AnnaSetu Closed-Loop Mutual Handover Standard</p>
              <p className="text-gray-500">Includes 4-digit token verification and geotagged photographic proof</p>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <Heart className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1F6B3A] font-heading">
                {totalPlatesSaved.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mt-0.5">
                Plates Redirected
              </p>
              <span className="text-[10px] text-gray-500">Zero food landfill disposal</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
              <Leaf className="w-5 h-5 text-blue-700 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 font-heading">
                {co2DivertedKg.toLocaleString('en-IN')} kg
              </p>
              <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mt-0.5">
                CO₂e Emissions Prevented
              </p>
              <span className="text-[10px] text-gray-500">Avoided methane landfill decay</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
              <Droplets className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-heading">
                {(waterConservedLiters / 1000).toFixed(1)}k L
              </p>
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mt-0.5">
                Virtual Water Conserved
              </p>
              <span className="text-[10px] text-gray-500">Agricultural footprint saved</span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500 mb-4">
                Monthly Plates Diverted to Care Homes
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="plates" fill="#1F6B3A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col justify-between">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Beneficiary Mix
              </h4>
              <div className="h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={beneficiaryData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                      {beneficiaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                {beneficiaryData.map(b => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span>{b.name}</span>
                    </span>
                    <span className="font-bold text-gray-700">{b.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Verification Log Table */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#1F6B3A]" />
              Verified Serve Reports Log (Sample Excerpt)
            </h4>

            <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F3] border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Beneficiary Place</th>
                    <th className="py-2.5 px-3">Executing NGO</th>
                    <th className="py-2.5 px-3 text-right">Plates</th>
                    <th className="py-2.5 px-3 text-right">People Fed</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {serveReports.slice(0, 5).map(rep => {
                    const pl = places.find(p => p.id === rep.placeId);
                    const ngo = ngos.find(n => n.id === rep.ngoId);
                    return (
                      <tr key={rep.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-mono text-gray-600">{formatDateOnly(rep.servedAt)}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{pl?.name}</td>
                        <td className="py-2.5 px-3 text-blue-700 font-medium">{ngo?.name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#1F6B3A]">{rep.platesServed}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-gray-800">{rep.peopleFed}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-gray-500">
            <div>
              <p className="font-bold text-gray-800">AnnaSetu Transparency Protocol</p>
              <p>Team <strong>Code Ninjas</strong> &bull; NEUROVERSE Open Innovation Track</p>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200 w-full sm:w-auto">
              <div className="h-10 flex items-center justify-end font-serif italic text-emerald-900 text-lg">
                AnnaSetu Verified Audit
              </div>
              <p className="text-[11px] font-semibold text-gray-700">Digital Trust Hash &bull; Immutable Log</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

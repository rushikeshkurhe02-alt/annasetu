import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { PROVIDER_CATEGORIES, NGO_FOCUS_AREAS } from '../utils/constants';
import { UserRole, ProviderCategory, NgoFocusArea } from '../types';
import { VerificationBadge } from '../components/common/VerificationBadge';
import {
  Utensils,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Building2,
  Phone,
  User,
  Sparkles,
  ArrowRight,
  Truck,
  Clock
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'provider';
  const initialMode = (searchParams.get('mode') as 'signin' | 'signup') || 'signin';

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);

  const navigate = useNavigate();
  const {
    login,
    registerProvider,
    registerNgo,
    loginAsDemoProvider,
    loginAsDemoNgo,
    isVerificationPending
  } = useAuth();
  const { addToast } = useDemo();

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Provider Sign-Up Form
  const [provForm, setProvForm] = useState({
    orgName: '',
    category: 'function_halls_karyalays' as ProviderCategory,
    subType: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    locality: 'Kothrud, Pune',
    typicalSurplusTime: 'After lunch (3:30 PM)',
    fssaiNumber: '',
    password: ''
  });

  // NGO Sign-Up Form
  const [ngoForm, setNgoForm] = useState({
    name: '',
    regNo: 'MH/PUN/2026/F-' + Math.floor(10000 + Math.random() * 90000),
    focusAreas: ['children', 'elderly'] as NgoFocusArea[],
    areasOfOperation: 'Kothrud, Swargate, Deccan',
    contact: '',
    phone: '',
    email: '',
    volunteersCount: 25,
    hasVehicle: true,
    vehicleDetails: 'Utility van with food crates',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      addToast({ type: 'error', title: 'Email required', message: 'Please enter your email.' });
      return;
    }

    const success = login(loginEmail, activeRole);
    if (success) {
      addToast({
        type: 'success',
        title: 'Welcome Back!',
        message: `Signed in as ${activeRole === 'provider' ? 'Food Provider' : 'NGO'}.`
      });
      navigate(activeRole === 'provider' ? '/provider-dashboard' : '/ngo-dashboard');
    } else {
      addToast({
        type: 'error',
        title: 'Account Not Found',
        message: `No ${activeRole} account matches this email. You can use 1-Tap Demo Account below!`
      });
    }
  };

  const handleProviderSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provForm.orgName || !provForm.email || !provForm.contact) {
      addToast({ type: 'error', title: 'Incomplete', message: 'Please fill required fields.' });
      return;
    }

    registerProvider({
      orgName: provForm.orgName,
      category: provForm.category,
      subType: provForm.subType || 'Food Facility',
      contact: provForm.contact,
      phone: provForm.phone,
      email: provForm.email,
      address: provForm.address,
      locality: provForm.locality,
      lat: 18.5204 + (Math.random() - 0.5) * 0.05,
      lng: 73.8567 + (Math.random() - 0.5) * 0.05,
      typicalSurplusTime: provForm.typicalSurplusTime,
      fssaiNumber: provForm.fssaiNumber || undefined
    });

    addToast({
      type: 'info',
      title: 'Registration Submitted',
      message: 'Running simulated trust and FSSAI credentials verification check...'
    });

    navigate('/provider-dashboard');
  };

  const handleNgoSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngoForm.name || !ngoForm.email || !ngoForm.contact) {
      addToast({ type: 'error', title: 'Incomplete', message: 'Please fill required fields.' });
      return;
    }

    const areasArray = ngoForm.areasOfOperation.split(',').map(s => s.trim()).filter(Boolean);

    registerNgo({
      name: ngoForm.name,
      regNo: ngoForm.regNo,
      focusAreas: ngoForm.focusAreas,
      areasOfOperation: areasArray.length > 0 ? areasArray : ['Pune Central'],
      contact: ngoForm.contact,
      phone: ngoForm.phone,
      email: ngoForm.email,
      volunteersCount: ngoForm.volunteersCount,
      hasVehicle: ngoForm.hasVehicle,
      vehicleDetails: ngoForm.vehicleDetails
    });

    addToast({
      type: 'info',
      title: 'NGO Registered',
      message: 'Running simulated registration number and vehicle audit...'
    });

    navigate('/ngo-dashboard');
  };

  const toggleFocusArea = (fa: NgoFocusArea) => {
    setNgoForm(prev => {
      const exists = prev.focusAreas.includes(fa);
      if (exists) {
        return { ...prev, focusAreas: prev.focusAreas.filter(a => a !== fa) };
      } else {
        return { ...prev, focusAreas: [...prev.focusAreas, fa] };
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 sm:py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Verification banner if active */}
        {isVerificationPending && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center gap-3 animate-pulse">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Verification in progress (demo check)</p>
              <p className="text-[11px] text-amber-800">
                Auditing institutional details against simulated NGO/donor records. Auto-verifying in 4 seconds...
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-md overflow-hidden">
          {/* Two Clearly Separate Choices: Provider vs NGO */}
          <div className="grid grid-cols-2 p-2 bg-[#FAF8F3] border-b border-gray-200 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveRole('provider')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'provider'
                  ? 'bg-[#1F6B3A] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>I am a Food Provider</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('ngo')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'ngo'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>I am an NGO</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Header description */}
            <div className="text-center mb-6">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                activeRole === 'provider' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
              }`}>
                {activeRole === 'provider' ? 'For Caterers, Banquets, Messes & Kitchens' : 'For Registered Relief & Volunteer Squads'}
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-gray-900 mt-2">
                {authMode === 'signin' ? 'Sign In to Your Dashboard' : `Register as ${activeRole === 'provider' ? 'Food Provider' : 'NGO Partner'}`}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {activeRole === 'provider'
                  ? 'List cooked surplus, review NGO distribution plans, and view photo reports.'
                  : 'Claim surplus offers, declare beneficiary plans, and post serving proof.'}
              </p>
            </div>

            {/* Quick 1-Tap Demo Account for Judges */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Judges & Evaluators 1-Tap Entrance
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Pre-configured
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeRole === 'provider') {
                    loginAsDemoProvider();
                    addToast({ type: 'success', title: 'Demo Provider Logged In', message: 'Entered as Shree Ganesh Banquet & Karyalay.' });
                    navigate('/provider-dashboard');
                  } else {
                    loginAsDemoNgo();
                    addToast({ type: 'success', title: 'Demo NGO Logged In', message: 'Entered as Roti Bank Pune Volunteers.' });
                    navigate('/ngo-dashboard');
                  }
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer ${
                  activeRole === 'provider' ? 'bg-[#1F6B3A] hover:bg-[#164e29]' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <span>Enter with Demo {activeRole === 'provider' ? 'Provider' : 'NGO'} Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Switch Sign In / Sign Up tabs */}
            <div className="flex border-b border-gray-200 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 pb-3 text-center transition-colors cursor-pointer ${
                  authMode === 'signin'
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 pb-3 text-center transition-colors cursor-pointer ${
                  authMode === 'signup'
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            {/* Forms */}
            {authMode === 'signin' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder={activeRole === 'provider' ? 'kulkarni.banquets@gmail.com' : 'rotibankpune@volunteer.org'}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Password (Mock)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                    activeRole === 'provider' ? 'bg-[#1F6B3A] hover:bg-[#164e29]' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Sign In to Dashboard
                </button>
              </form>
            ) : activeRole === 'provider' ? (
              /* PROVIDER SIGN UP */
              <form onSubmit={handleProviderSignUp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Organisation / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={provForm.orgName}
                    onChange={e => setProvForm({ ...provForm, orgName: e.target.value })}
                    placeholder="e.g. Royal Palace Banquet & Lawns"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Provider Category *
                    </label>
                    <select
                      value={provForm.category}
                      onChange={e => setProvForm({ ...provForm, category: e.target.value as ProviderCategory })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A] font-medium"
                    >
                      {PROVIDER_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Sub-Type
                    </label>
                    <input
                      type="text"
                      value={provForm.subType}
                      onChange={e => setProvForm({ ...provForm, subType: e.target.value })}
                      placeholder="e.g. Wedding Reception Lawn"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={provForm.contact}
                      onChange={e => setProvForm({ ...provForm, contact: e.target.value })}
                      placeholder="e.g. Vilas Shinde (Manager)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={provForm.phone}
                      onChange={e => setProvForm({ ...provForm, phone: e.target.value })}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={provForm.email}
                      onChange={e => setProvForm({ ...provForm, email: e.target.value })}
                      placeholder="donor@domain.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Locality / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={provForm.locality}
                      onChange={e => setProvForm({ ...provForm, locality: e.target.value })}
                      placeholder="e.g. Kothrud, Pune"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Pickup Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={provForm.address}
                    onChange={e => setProvForm({ ...provForm, address: e.target.value })}
                    placeholder="Street, Landmark, Kitchen loading dock..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Typical Surplus Times
                    </label>
                    <input
                      type="text"
                      value={provForm.typicalSurplusTime}
                      onChange={e => setProvForm({ ...provForm, typicalSurplusTime: e.target.value })}
                      placeholder="e.g. After lunch (3:30 PM)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      FSSAI License No. <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={provForm.fssaiNumber}
                      onChange={e => setProvForm({ ...provForm, fssaiNumber: e.target.value })}
                      placeholder="14-digit FSSAI number"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F6B3A] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1F6B3A] hover:bg-[#164e29] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer mt-2"
                >
                  Create Food Provider Account
                </button>
              </form>
            ) : (
              /* NGO SIGN UP */
              <form onSubmit={handleNgoSignUp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    NGO / Trust Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ngoForm.name}
                    onChange={e => setNgoForm({ ...ngoForm, name: e.target.value })}
                    placeholder="e.g. Annapurna Youth Foundation"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Trust / Reg No. <span className="text-gray-400 font-normal">(demo)</span>
                    </label>
                    <input
                      type="text"
                      value={ngoForm.regNo}
                      onChange={e => setNgoForm({ ...ngoForm, regNo: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Volunteer Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={ngoForm.volunteersCount}
                      onChange={e => setNgoForm({ ...ngoForm, volunteersCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>
                </div>

                {/* Focus Area Chips */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Focus Beneficiaries (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {NGO_FOCUS_AREAS.map(fa => {
                      const selected = ngoForm.focusAreas.includes(fa.id);
                      return (
                        <button
                          key={fa.id}
                          type="button"
                          onClick={() => toggleFocusArea(fa.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            selected
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {fa.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Lead Coordinator *
                    </label>
                    <input
                      type="text"
                      required
                      value={ngoForm.contact}
                      onChange={e => setNgoForm({ ...ngoForm, contact: e.target.value })}
                      placeholder="e.g. Rajesh Kulkarni"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={ngoForm.phone}
                      onChange={e => setNgoForm({ ...ngoForm, phone: e.target.value })}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={ngoForm.email}
                      onChange={e => setNgoForm({ ...ngoForm, email: e.target.value })}
                      placeholder="ngo@volunteer.org"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Operational Zones
                    </label>
                    <input
                      type="text"
                      value={ngoForm.areasOfOperation}
                      onChange={e => setNgoForm({ ...ngoForm, areasOfOperation: e.target.value })}
                      placeholder="e.g. Kothrud, Hadapsar, Swargate"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Transport */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={ngoForm.hasVehicle}
                      onChange={e => setNgoForm({ ...ngoForm, hasVehicle: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>We have dedicated vehicle(s) for food pickup</span>
                  </label>

                  {ngoForm.hasVehicle && (
                    <input
                      type="text"
                      value={ngoForm.vehicleDetails}
                      onChange={e => setNgoForm({ ...ngoForm, vehicleDetails: e.target.value })}
                      placeholder="e.g. Mahindra Bolero with insulated crates (MH-12-XX-1234)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer mt-2"
                >
                  Create NGO Partner Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

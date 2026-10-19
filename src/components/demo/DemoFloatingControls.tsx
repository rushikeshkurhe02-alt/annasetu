import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Wand2,
  Clock,
  FastForward,
  RotateCcw,
  PlusCircle,
  FileCheck2,
  Send,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { formatDateTime } from '../../utils/rules';

export const DemoFloatingControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    simulatedTimeMs,
    timeSpeed,
    setTimeSpeed,
    triggerSimulateNewOffer,
    triggerSimulateNgoRequest,
    triggerAutoServeReport,
    resetAllDemoData
  } = useDemo();
  const { user, loginAsDemoProvider, loginAsDemoNgo, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-84 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl p-4 text-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Demo Sandbox</h4>
                <p className="text-[10px] text-gray-500 font-medium">NEUROVERSE • Team Code Ninjas</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700"
              aria-label="Close demo panel"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Simulated Clock & Time Speed */}
          <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-2.5 mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Simulated Clock
              </span>
              <span className="font-mono text-[11px] font-semibold text-gray-800">
                {formatDateTime(new Date(simulatedTimeMs).toISOString())}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-200/50">
              <span className="text-[11px] text-gray-500 font-medium">Speed:</span>
              <div className="flex gap-1">
                {[1, 60, 300].map(s => (
                  <button
                    key={s}
                    onClick={() => setTimeSpeed(s as 1 | 60 | 300)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      timeSpeed === s
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {s}x {s > 1 ? (s === 60 ? '(1s=1m)' : '(1s=5m)') : 'Normal'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Demo Switch */}
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              1-Tap Demo Logins
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  loginAsDemoProvider();
                  navigate('/provider-dashboard');
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  user?.role === 'provider'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Provider
              </button>

              <button
                onClick={() => {
                  loginAsDemoNgo();
                  navigate('/ngo-dashboard');
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  user?.role === 'ngo'
                    ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                    : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                NGO
              </button>
            </div>
            {user && (
              <button
                onClick={() => logout()}
                className="w-full text-center text-[11px] text-gray-500 hover:text-red-600 mt-1.5 py-0.5 underline cursor-pointer"
              >
                Sign out current session
              </button>
            )}
          </div>

          {/* Event Simulation Triggers */}
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Trigger Simulated Events
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={triggerSimulateNewOffer}
                className="w-full py-1.5 px-3 bg-white border border-gray-200 hover:border-emerald-500 rounded-xl text-xs font-medium text-gray-700 hover:text-emerald-800 flex items-center gap-2 transition-all shadow-xs text-left"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Simulate new surplus offer</span>
              </button>

              <button
                onClick={() => triggerSimulateNgoRequest()}
                className="w-full py-1.5 px-3 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-xs font-medium text-gray-700 hover:text-blue-800 flex items-center gap-2 transition-all shadow-xs text-left"
              >
                <Send className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Simulate NGO plan request</span>
              </button>

              <button
                onClick={triggerAutoServeReport}
                className="w-full py-1.5 px-3 bg-white border border-gray-200 hover:border-purple-500 rounded-xl text-xs font-medium text-gray-700 hover:text-purple-800 flex items-center gap-2 transition-all shadow-xs text-left"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Auto-fill verified serve report</span>
              </button>
            </div>
          </div>

          {/* Reset Sandbox */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={resetAllDemoData}
              className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all demo data
            </button>
            <span className="text-[10px] text-gray-400">All data in localStorage</span>
          </div>
        </div>
      )}

      {/* Floating launcher button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-4 py-2.5 bg-[#1F6B3A] text-white rounded-full shadow-xl hover:bg-[#164e29] active:scale-95 transition-all duration-200 border-2 border-emerald-400/40"
        aria-label="Toggle Demo Controls"
      >
        <Wand2 className="w-4 h-4 animate-pulse text-amber-300" />
        <span className="text-xs font-bold tracking-wide">Demo Sandbox</span>
        {timeSpeed > 1 && (
          <span className="bg-amber-400 text-gray-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
            {timeSpeed}x
          </span>
        )}
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
};

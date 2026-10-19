import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#183B23] text-emerald-100/90 pt-12 pb-8 border-t border-emerald-950 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-white font-extrabold text-lg">
                अ
              </div>
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                AnnaSetu
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-300 border border-emerald-700">
                Prototoype
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-md">
              AnnaSetu (अन्नसेतू) is an institutional trust and relationship platform connecting food surplus generators (banquet halls, messes, caterers, hotels) with registered NGOs to reliably feed care centers. Not a food ordering app—a transparent proof-of-serving network.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-700/50 text-[11px] text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Created for <strong>NEUROVERSE Ideathon</strong> (Open Innovation Track) by <strong>Team Code Ninjas</strong></span>
            </div>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Trust Directory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/providers" className="hover:text-white transition-colors">
                  Food Providers (8 Categories)
                </Link>
              </li>
              <li>
                <Link to="/places" className="hover:text-white transition-colors">
                  Places in Need (Orphanages & Shelters)
                </Link>
              </li>
              <li>
                <Link to="/ngos" className="hover:text-white transition-colors">
                  Registered NGO Network
                </Link>
              </li>
              <li>
                <Link to="/ngo-dashboard" className="hover:text-white transition-colors">
                  Live Food Surplus Feed
                </Link>
              </li>
              <li>
                <Link to="/impact-report" className="hover:text-white transition-colors">
                  CSR Impact & Audit Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance note */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              FSSAI & Hygiene Safety
            </h4>
            <div className="p-3 bg-emerald-900/40 border border-emerald-700/40 rounded-xl space-y-2 text-[11px] text-emerald-200/90 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Simulated Safe Windows</span>
              </div>
              <p>
                Default safe consumption limits per food type are prototype reference benchmarks. All real-world distributions must comply with FSSAI hygiene guidelines for cooked surplus redistribution.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Wastage Institutional Trust Loop • Pure Verification Architecture</span>
          </div>
          <div>
            Pune Pilot Demo • All data is simulated for ideathon demonstration
          </div>
        </div>
      </div>
    </footer>
  );
};

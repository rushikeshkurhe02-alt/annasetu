import React from 'react';
import { ShieldCheck, Award, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  type?: 'verified' | 'pending' | 'provider_confirmed';
  size?: 'sm' | 'md';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type = 'verified',
  size = 'md'
}) => {
  if (type === 'pending') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}>
        <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-amber-600'} />
        <span>Pending review (demo)</span>
      </span>
    );
  }

  if (type === 'provider_confirmed') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}>
        <Award className={size === 'sm' ? 'w-3 h-3 text-emerald-700' : 'w-4 h-4 text-emerald-700'} />
        <span>Provider verified this report</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300/60 rounded-full shadow-xs ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'}`}>
      <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-700' : 'w-3.5 h-3.5 text-emerald-700'} />
      <span>Verified (demo)</span>
    </span>
  );
};

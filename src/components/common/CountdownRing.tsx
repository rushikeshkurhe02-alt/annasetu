import React from 'react';
import { calculateSafeUntilCountdown } from '../../utils/rules';
import { useDemo } from '../../context/DemoContext';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CountdownRingProps {
  createdAt: string;
  safeUntil: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  createdAt,
  safeUntil,
  size = 'md',
  showDetails = true
}) => {
  const { simulatedTimeMs } = useDemo();
  const countdown = calculateSafeUntilCountdown(createdAt, safeUntil, simulatedTimeMs);

  const radius = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;
  const stroke = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (countdown.percentRemaining / 100) * circumference;

  let colorClass = 'text-emerald-600 stroke-emerald-600';
  let bgBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let Icon = CheckCircle2;

  if (countdown.urgencyLevel === 'expired') {
    colorClass = 'text-red-700 stroke-red-700';
    bgBadgeClass = 'bg-red-50 text-red-800 border-red-200';
    Icon = ShieldAlert;
  } else if (countdown.urgencyLevel === 'critical') {
    colorClass = 'text-red-600 stroke-red-600';
    bgBadgeClass = 'bg-red-50 text-red-700 border-red-200';
    Icon = AlertTriangle;
  } else if (countdown.urgencyLevel === 'warning') {
    colorClass = 'text-amber-500 stroke-amber-500';
    bgBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = Clock;
  }

  const svgDimension = (radius + stroke) * 2;

  return (
    <div className="flex items-center gap-3">
      {/* Visual ring with percentage & text */}
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg
          height={svgDimension}
          width={svgDimension}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
          {/* Progress circle */}
          <circle
            className={`transition-all duration-500 ease-out ${colorClass}`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
        </svg>
        <span className="absolute text-[11px] font-bold tracking-tight text-gray-700">
          {countdown.percentRemaining}%
        </span>
      </div>

      {showDetails && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${bgBadgeClass}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{countdown.formattedTime}</span>
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-0.5">
            {countdown.urgencyLabel}
          </span>
        </div>
      )}
    </div>
  );
};

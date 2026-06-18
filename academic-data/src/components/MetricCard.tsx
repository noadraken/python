import React from 'react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle: string;
  trend?: string;
  color: 'green' | 'blue' | 'purple' | 'amber';
  onClick?: () => void;
}

export default function MetricCard({
  id,
  title,
  value,
  icon,
  subtitle,
  trend,
  color,
  onClick
}: MetricCardProps) {
  // If blue color, let's render it as a premium call-to-action block similar to the design
  if (color === 'blue') {
    return (
      <div
        id={id}
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl shadow-md shadow-blue-600/10 active:scale-[0.98] transition-all flex flex-col justify-between cursor-pointer border border-transparent text-white group"
      >
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">{title}</p>
          <div className="text-blue-200 group-hover:text-white transition-colors">{icon}</div>
        </div>
        <p className="text-xl font-extrabold text-white mt-1.5 tracking-tight">{value}</p>
        <p className="text-[10px] text-blue-200 mt-1 font-medium">{subtitle}</p>
      </div>
    );
  }

  // Emerald green card for outstanding GPA
  if (color === 'green') {
    return (
      <div id={id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex items-center gap-0.5 text-emerald-600 text-[10px] font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" />
            </svg>
            <span>{trend || 'STABLE'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium font-mono">{subtitle}</span>
        </div>
      </div>
    );
  }

  // Purple and amber cards
  const borderColors = {
    purple: 'border-slate-200',
    amber: 'border-slate-200'
  };

  const textColors = {
    purple: 'text-violet-600',
    amber: 'text-amber-600'
  }

  return (
    <div
      id={id}
      className={`bg-white p-4 rounded-xl border ${borderColors[color]} shadow-sm flex justify-between items-start hover:border-slate-300 transition duration-150`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-medium">{subtitle}</p>
      </div>
      <div className={`p-2 rounded-lg bg-slate-50 ${textColors[color]} border border-slate-100`}>
        {icon}
      </div>
    </div>
  );
}


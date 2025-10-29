
import React from 'react';

interface ResultSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const ResultSection: React.FC<ResultSectionProps> = ({ title, icon, children }) => {
  return (
    <div className="mt-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        {icon}
        {title}
      </h3>
      <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-headings:text-cyan-400">
        {children}
      </div>
    </div>
  );
};

export default ResultSection;

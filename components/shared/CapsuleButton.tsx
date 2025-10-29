
import React from 'react';

interface CapsuleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const CapsuleButton: React.FC<CapsuleButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-200 ${
        isActive
          ? 'bg-cyan-500 border-cyan-500 text-white'
          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
      }`}
    >
      {label}
    </button>
  );
};

export default CapsuleButton;

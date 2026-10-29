import React from 'react';

interface AlgeriaFlagProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
}

export const AlgeriaFlag: React.FC<AlgeriaFlagProps> = ({
  className = '',
  size = 'md',
  shape = 'circle'
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-slate-200/80 ring-1 ring-black/5 ${sizeClasses[size]} ${shapeClasses} ${className}`}
      title="الجمهورية الجزائرية الديمقراطية الشعبية 🇩🇿"
      aria-label="علم الجزائر"
    >
      <svg
        viewBox="0 0 900 600"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Green Half */}
        <rect width="450" height="600" fill="#006233" />
        {/* Right White Half */}
        <rect x="450" width="450" height="600" fill="#ffffff" />
        
        {/* Red Crescent Outer Circle */}
        <circle cx="450" cy="300" r="150" fill="#d21034" />
        {/* White Inner Cutout Circle creating the Crescent */}
        <circle cx="487.5" cy="300" r="120" fill="#ffffff" />
        {/* Red overlap repair for green half behind crescent cutout */}
        <path
          d="M 450,180 A 120,120 0 0,0 450,420 Z"
          fill="#006233"
        />

        {/* Red 5-pointed Star */}
        <polygon
          points="
            495,242
            508,280
            548,280
            516,303
            528,341
            495,317
            462,341
            474,303
            442,280
            482,280
          "
          fill="#d21034"
        />
      </svg>
    </div>
  );
};

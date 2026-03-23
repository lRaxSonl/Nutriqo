'use client';

import React from 'react';
import Image from 'next/image';

interface MacroCardProps {
  label: string;
  current: number;
  target: number;
  progress: number;
  iconSrc: string;
  bgLight: string;
  bgDark: string;
  progressColor: string;
}

export const MacroCard: React.FC<MacroCardProps> = ({
  label,
  current,
  target,
  progress,
  iconSrc,
  bgLight,
  bgDark,
  progressColor,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bgLight} ${bgDark} flex items-center justify-center flex-shrink-0`}>
        <Image src={iconSrc} alt={label} width={24} height={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-1">
          <h3 className="font-bold text-gray-700 dark:text-gray-200">{label}</h3>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {current}<span className="text-gray-400 dark:text-gray-500 font-normal">/{target}г</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full rounded-full ${progressColor} transition-all duration-700`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

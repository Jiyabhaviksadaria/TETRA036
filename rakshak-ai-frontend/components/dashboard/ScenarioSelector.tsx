'use client';

import React from 'react';
import { Play, Loader2, Target } from 'lucide-react';
import { InfoPopover } from '../ui/InfoPopover';
import { useTheme } from '../../context/ThemeContext';

interface ScenarioSelectorProps {
  selectedScenario: string;
  onSelectScenario: (scenario: string) => void;
  onStartSimulation: () => void;
  isRunning: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenario,
  onSelectScenario,
  onStartSimulation,
  isRunning,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scenarios = [
    { name: 'Wild Boar', emoji: '🐗' },
    { name: 'Cow', emoji: '🐄' },
    { name: 'Nilgai', emoji: '🦌' },
    { name: 'Dog', emoji: '🐕' },
    { name: 'Human', emoji: '👤' },
  ];

  return (
    <div
      className={`rounded-[24px] p-5 border space-y-4 transition-all duration-300 ${
        isDark
          ? 'glass-panel bg-[#163E2D]/90 border-[#246B49]/60 text-[#F4F1E8] shadow-[0_10px_30px_rgba(14,40,28,0.8)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      {/* Header with High-Contrast Typography */}
      <div className="flex items-center justify-between pb-2 border-b border-[#246B49]/40">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#F2C879]" />
          <h3 className={`font-display font-black text-sm sm:text-base tracking-wide ${isDark ? 'text-[#F2C879]' : 'text-[#0E281C]'}`}>
            SCENARIO INTRUSION SIMULATOR
          </h3>
          <InfoPopover text="Select an intruder scenario to test AI threat classification and non-lethal response recommendations." />
        </div>
        <span className="text-xs font-mono font-bold text-[#A3B8AD]">5 Presets</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* 5 Scenario Pill Toggle Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.name;
            return (
              <button
                key={sc.name}
                type="button"
                onClick={() => !isRunning && onSelectScenario(sc.name)}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#246B49] text-[#F2C879] border-[#4ADE80] shadow-md scale-105'
                    : isDark
                    ? 'bg-[#0E281C]/70 border-[#246B49]/40 text-[#A3B8AD] hover:text-white hover:border-[#246B49]'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-base">{sc.emoji}</span>
                <span>{sc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Start Simulation Trigger Button */}
        <button
          type="button"
          onClick={onStartSimulation}
          disabled={isRunning || !selectedScenario}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md cursor-pointer ${
            isRunning
              ? 'bg-[#246B49] text-white cursor-wait'
              : 'bg-[#246B49] hover:bg-[#2E8B5E] text-[#F2C879] border border-[#4ADE80]/50 active:scale-95'
          } ${!selectedScenario ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#F2C879]" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-[#F2C879]" />
              <span>Start Simulation</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};

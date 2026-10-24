import React from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import { ARCHITECTURE_PRESETS } from '../constants/presets';
import { ArchitecturePreset } from '../types/cadence';

interface PresetBarProps {
  onSelectPreset: (preset: ArchitecturePreset) => void;
  activePresetId?: string;
}

export function PresetBar({ onSelectPreset, activePresetId }: PresetBarProps) {
  return (
    <div className="space-y-1.5 font-mono">
      <div className="flex items-center justify-between text-xs pb-1 border-b border-[#111111]">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider">
          <Layers className="w-3.5 h-3.5 text-[#FF4F00]" />
          <span>[TOPOLOGY PRESETS // 1-CLICK SEED]</span>
        </div>
        <span className="text-[9px] text-[#767676] uppercase">AUTO-LOAD</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ARCHITECTURE_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group flex flex-col items-start p-2.5 border border-[#111111] text-left transition-all ${
                isActive
                  ? 'bg-[#111111] text-[#FFFFFF] shadow-cad-orange'
                  : 'bg-[#FFFFFF] hover:bg-[#F4F3EF] shadow-cad active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 uppercase border border-current ${
                    isActive ? 'text-[#FF4F00] bg-[#111111]' : 'text-[#111111] bg-[#F4F3EF]'
                  }`}
                >
                  {preset.badge}
                </span>
                <ArrowUpRight className={`w-3 h-3 ${isActive ? 'text-[#FF4F00]' : 'text-[#767676]'}`} />
              </div>

              <div className="text-[11px] font-bold font-sans uppercase truncate w-full">
                {preset.title}
              </div>

              <p className={`text-[9px] line-clamp-1 mt-0.5 ${isActive ? 'text-[#DDDBD3]' : 'text-[#767676]'}`}>
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

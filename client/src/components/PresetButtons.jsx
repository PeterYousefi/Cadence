import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { ARCHITECTURE_PRESETS } from '../constants/presets.js';

export function PresetButtons({ onSelectPreset, activePresetId }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="uppercase tracking-wider font-semibold">Topology Presets</span>
        </div>
        <span className="text-[10px] text-zinc-500">1-Click Seed</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ARCHITECTURE_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-800/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold"
                  style={{
                    backgroundColor: `${preset.color}20`,
                    color: preset.color,
                    borderColor: `${preset.color}40`,
                    borderWidth: 1
                  }}
                >
                  {preset.badge}
                </span>
                <Sparkles className="w-3 h-3 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
              </div>

              <div className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors truncate w-full">
                {preset.title}
              </div>

              <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5 group-hover:text-zinc-400 transition-colors">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

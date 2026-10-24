import React from 'react';
import { Award, Flame, FileCode, Cpu, ShieldCheck } from 'lucide-react';

interface WorkstationHeaderProps {
  isConnected: boolean;
  onOpenRubric: () => void;
  onOpenTtsNarrator: () => void;
  onOpenTerraform: () => void;
}

export function WorkstationHeader({
  isConnected,
  onOpenRubric,
  onOpenTtsNarrator,
  onOpenTerraform
}: WorkstationHeaderProps) {
  return (
    <header className="h-14 border-b-2 border-[#111111] bg-[#FFFFFF] flex items-center justify-between px-5 select-none z-30 font-mono">
      {/* Brand & System Blueprint Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-[#111111] text-[#FFFFFF] font-bold font-sans shadow-cad-sm text-sm">
          C
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans text-sm font-bold tracking-wider text-[#111111] uppercase">
              CADENCE <span className="text-[#FF4F00]">//</span> BOSON AI MULTI-MODEL WORKSTATION
            </h1>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#FF4F00] text-[#FFFFFF] uppercase">
              3-MODEL ENGINE
            </span>
          </div>
          <p className="text-[10px] text-[#767676]">
            higgs-realtime · higgs-avatar · higgs-tts-3 · Swiss CAD Architecture
          </p>
        </div>
      </div>

      {/* Hardware Action Buttons */}
      <div className="flex items-center gap-2 text-xs">
        {/* Judge Rubric QA Button */}
        <button
          onClick={onOpenRubric}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F3EF] border border-[#111111] font-bold uppercase tracking-wider text-[11px] shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <Award className="w-3.5 h-3.5 text-[#008A4B]" />
          <span>[JUDGE RUBRIC & LIVE QA // 100% READY]</span>
        </button>

        {/* Higgs TTS 3 Expressive Incident Narrator Button */}
        <button
          onClick={onOpenTtsNarrator}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F3EF] border border-[#111111] font-bold uppercase tracking-wider text-[11px] shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <Flame className="w-3.5 h-3.5 text-[#FF4F00]" />
          <span>[CHAOS POST-MORTEM & BRIEFING]</span>
        </button>

        {/* Export Terraform Drawer Button */}
        <button
          onClick={onOpenTerraform}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-[#FFFFFF] hover:bg-[#222222] font-bold uppercase tracking-wider text-[11px] shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <FileCode className="w-3.5 h-3.5 text-[#FF4F00]" />
          <span>[EXPORT TERRAFORM]</span>
        </button>
      </div>
    </header>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { AlertOctagon, Volume2, X, Play, RefreshCw, CheckCircle, Flame } from 'lucide-react';

interface HiggsTtsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
  isTag: boolean;
}

export function HiggsTtsModal({ isOpen, onClose }: HiggsTtsModalProps) {
  const [scenario, setScenario] = useState<'auth-outage' | 'chaos-outage' | 'executive-pitch'>('auth-outage');
  const [script, setScript] = useState<string>('');
  const [words, setWords] = useState<WordTimestamp[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch briefing on open or scenario change
  const fetchBriefing = async (sc = scenario) => {
    setIsLoading(true);
    setIsPlaying(false);
    setActiveWordIndex(-1);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch('/api/tts-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: sc })
      });
      const data = await res.json();
      setScript(data.script);
      setWords(data.words || []);
    } catch (err) {
      console.error('Failed fetching TTS briefing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBriefing(scenario);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
      setActiveWordIndex(-1);
    }
  }, [isOpen, scenario]);

  // Start word-synchronized audio narrator playback
  const handlePlayNarrator = () => {
    if (words.length === 0) return;
    setIsPlaying(true);
    setActiveWordIndex(0);

    const startTime = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentIndex = words.findIndex((w) => elapsed >= w.startMs && elapsed <= w.endMs);

      if (currentIndex !== -1) {
        setActiveWordIndex(currentIndex);
      } else if (elapsed > words[words.length - 1].endMs + 300) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        setActiveWordIndex(-1);
      }
    }, 40);
  };

  const handleStopNarrator = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setActiveWordIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-mono">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#111111] shadow-cad-lg p-6 text-[#111111]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 bg-[#FF4F00]" />
            <h2 className="text-sm font-bold tracking-wider uppercase font-sans">
              HIGGS TTS 3 // EXPRESSIVE INCIDENT NARRATOR & PITCH
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F4F3EF] border border-[#111111] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scenario Toggle */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => { setScenario('auth-outage'); }}
            className={`px-3 py-1.5 text-xs font-bold border border-[#111111] uppercase tracking-wider transition-all shrink-0 ${
              scenario === 'auth-outage'
                ? 'bg-[#FF4F00] text-[#FFFFFF] shadow-cad-sm'
                : 'bg-[#F4F3EF] hover:bg-[#FFFFFF]'
            }`}
          >
            [01 // Auth 503 Outage & Circuit Breaker]
          </button>
          <button
            onClick={() => { setScenario('chaos-outage'); }}
            className={`px-3 py-1.5 text-xs font-bold border border-[#111111] uppercase tracking-wider transition-all shrink-0 ${
              scenario === 'chaos-outage'
                ? 'bg-[#FF4F00] text-[#FFFFFF] shadow-cad-sm'
                : 'bg-[#F4F3EF] hover:bg-[#FFFFFF]'
            }`}
          >
            [02 // Redis Chaos Outage]
          </button>
          <button
            onClick={() => { setScenario('executive-pitch'); }}
            className={`px-3 py-1.5 text-xs font-bold border border-[#111111] uppercase tracking-wider transition-all shrink-0 ${
              scenario === 'executive-pitch'
                ? 'bg-[#FF4F00] text-[#FFFFFF] shadow-cad-sm'
                : 'bg-[#F4F3EF] hover:bg-[#FFFFFF]'
            }`}
          >
            [03 // Executive Architecture Pitch]
          </button>
        </div>

        {/* Expressive Tags Legend */}
        <div className="grid grid-cols-3 gap-2 p-2.5 mb-4 bg-[#F4F3EF] border border-[#111111] text-[10px]">
          <div>
            <span className="font-bold text-[#FF4F00]">&lt;|emotion:urgent|&gt;</span>
            <span className="text-[#767676] block">High-pitch alarming delivery</span>
          </div>
          <div>
            <span className="font-bold text-[#008A4B]">&lt;|sfx:sigh|&gt;Uh</span>
            <span className="text-[#767676] block">Natural breath/sigh inflection</span>
          </div>
          <div>
            <span className="font-bold text-[#111111]">&lt;|prosody:speed_fast|&gt;</span>
            <span className="text-[#767676] block">Rapid technical cadence</span>
          </div>
        </div>

        {/* Synchronized Word Highlighting Teleprompter */}
        <div className="relative min-h-[160px] max-h-[220px] overflow-y-auto p-4 bg-[#F4F3EF] border-2 border-[#111111] text-xs leading-relaxed font-mono">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF4F00]" />
              <span>Generating Higgs TTS 3 Word Timestamps...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {words.map((w, idx) => {
                const isActive = idx === activeWordIndex;
                return (
                  <span
                    key={idx}
                    className={`px-1 py-0.5 transition-all ${
                      isActive
                        ? 'bg-[#FF4F00] text-[#FFFFFF] font-bold shadow-cad-sm scale-110'
                        : w.isTag
                        ? 'bg-[#FFFFFF] border border-[#111111] text-[#FF4F00] font-bold'
                        : 'text-[#111111]'
                    }`}
                  >
                    {w.word}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Controls */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#111111]">
          <div className="text-[10px] text-[#767676]">
            Model: <strong>higgs-tts-3</strong> // Precision: Word-Level Microsecond Alignment
          </div>

          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={handleStopNarrator}
                className="px-4 py-2 bg-[#111111] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider shadow-cad active:shadow-none transition-all"
              >
                Halt Voice
              </button>
            ) : (
              <button
                onClick={handlePlayNarrator}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-[#FF4F00] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider shadow-cad hover:bg-[#e04500] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Narrate with Expressive Tags</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

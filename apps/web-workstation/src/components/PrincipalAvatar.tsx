import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';

export interface Persona {
  id: string;
  name: string;
  role: string;
  voice: string;
  image: string;
  avatarUrl?: string;
}

export type AvatarPersona = Persona;

export const PERSONAS: Persona[] = [
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Lead Architect',
    voice: 'marcus',
    image: '/avatars/marcus.jpg',
    avatarUrl: '/avatars/marcus.jpg'
  },
  {
    id: 'chloe',
    name: 'Chloe',
    role: 'UX Specialist',
    voice: 'chloe',
    image: '/avatars/chloe.jpg',
    avatarUrl: '/avatars/chloe.jpg'
  },
  {
    id: 'oliver',
    name: 'Oliver',
    role: 'Backend Engineer',
    voice: 'oliver',
    image: '/avatars/oliver.jpg',
    avatarUrl: '/avatars/oliver.jpg'
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Data Scientist',
    voice: 'sophia',
    image: '/avatars/sophia.jpg',
    avatarUrl: '/avatars/sophia.jpg'
  },
  {
    id: 'liam',
    name: 'Liam',
    role: 'DevOps Lead',
    voice: 'liam',
    image: '/avatars/liam.jpg',
    avatarUrl: '/avatars/liam.jpg'
  }
];

export const AVATAR_PERSONAS = PERSONAS;

interface PrincipalAvatarProps {
  isSpeaking: boolean;
  isDuplexActive: boolean;
  audioSource?: {
    getTimeDomainData: (target: Uint8Array) => void;
    getFrequencyData?: (target: Uint8Array) => void;
  } | null;
  selectedPersona?: Persona;
  onSelectAvatar?: (persona: Persona) => void;
}

export function PrincipalAvatar({
  isSpeaking,
  isDuplexActive,
  audioSource,
  selectedPersona: externalSelectedPersona,
  onSelectAvatar
}: PrincipalAvatarProps) {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(
    externalSelectedPersona || PERSONAS[0]
  );
  const [customPortraitUrl, setCustomPortraitUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [mouthOpen, setMouthOpen] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync internal selectedPersona if externally passed
  useEffect(() => {
    if (externalSelectedPersona) {
      setSelectedPersona(externalSelectedPersona);
    }
  }, [externalSelectedPersona]);

  // High-performance 60fps WebAudio Lip-Sync & Volume Sampler
  useEffect(() => {
    const freqData = new Uint8Array(64);
    const timeData = new Uint8Array(64);

    const sampleAudio = () => {
      if (isSpeaking && audioSource) {
        // 1. Sample frequency data for amplitude scaling & dynamic glow
        if (audioSource.getFrequencyData) {
          audioSource.getFrequencyData(freqData);
        }
        // 2. Sample time domain data for instantaneous mouth movement
        audioSource.getTimeDomainData(timeData);

        // Average vocal frequency bins (fundamental voice spectrum)
        let freqSum = 0;
        for (let i = 0; i < 32; i++) {
          freqSum += freqData[i];
        }
        const freqAvg = freqSum / 32; // 0..255
        const normVol = Math.min(1, Math.max(0, freqAvg / 115));

        // Time domain RMS deviation for aperture
        let timeSum = 0;
        for (let i = 0; i < timeData.length; i++) {
          timeSum += Math.abs(timeData[i] - 128);
        }
        const timeAvg = timeSum / timeData.length;
        const normAperture = Math.min(1, Math.max(0, timeAvg / 28));

        setAudioVolume(normVol);
        setMouthOpen(Math.max(normAperture, normVol * 0.8));
      } else {
        // Smooth return to static resting state
        setAudioVolume(0);
        setMouthOpen(0);
      }
      animFrameRef.current = requestAnimationFrame(sampleAudio);
    };

    sampleAudio();

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSpeaking, audioSource]);

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setCustomPortraitUrl(null);
    if (onSelectAvatar) {
      onSelectAvatar(persona);
    }
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomPortraitUrl(result);
      setIsUploading(false);
      if (onSelectAvatar) {
        onSelectAvatar({
          ...selectedPersona,
          image: result,
          avatarUrl: result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const activeImageSource = customPortraitUrl || selectedPersona.image;

  return (
    <div className="border border-[#111111] bg-[#FFFFFF] shadow-cad p-3 text-xs font-mono">
      {/* Module Title & Dynamic Persona Tag */}
      <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#FF4F00] inline-block" />
          <span className="font-bold tracking-wider text-[11px] uppercase">
            [01 // PRINCIPAL ARCHITECT AVATAR]
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-[#F4F3EF] border border-[#111111] px-1.5 py-0.5">
          <span className="font-bold uppercase text-[#FF4F00]">{selectedPersona.name.toUpperCase()}</span>
          <span className="text-[#767676]">({selectedPersona.voice})</span>
        </div>
      </div>

      {/* 5-Avatar 1-Click Persona Carousel */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-[9px] text-[#767676] mb-1 font-bold uppercase tracking-wider">
          <span>SELECT ADVISOR PERSONA:</span>
          <span className="text-[#008A4B]">{selectedPersona.role}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#F4F3EF] border border-[#111111]">
          {PERSONAS.map((p) => {
            const isSelected = !customPortraitUrl && selectedPersona.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPersona(p)}
                className={`relative flex flex-col items-center gap-0.5 p-1 transition-all ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-2 border-[#FF4F00] shadow-cad-sm scale-105'
                    : 'border border-[#111111]/30 hover:border-[#111111] bg-[#FFFFFF]/60 hover:bg-[#FFFFFF] opacity-80 hover:opacity-100'
                }`}
                title={`${p.name} — ${p.role} (Voice: ${p.voice})`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#111111] bg-[#E2E0D8]">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] font-bold text-[#111111] truncate max-w-[44px]">{p.name}</span>
                <span className="text-[7px] text-[#767676] truncate max-w-[44px]">{p.voice}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF4F00] rounded-full border border-[#FFFFFF]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Avatar Viewport: Fixed aspect ratio, uncropped scaling, and audio-reactive lip-sync */}
      <div className="relative w-full h-64 bg-[#F4F3EF] border-2 border-[#111111] flex items-center justify-center p-4 overflow-hidden">
        {/* Background blueprint grid */}
        <div className="absolute inset-0 blueprint-dots pointer-events-none opacity-40" />

        {/* Audio Reactive Container: scale pulse, subtle bobbing, and glowing border */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: isSpeaking
              ? `scale(${1 + audioVolume * 0.035}) translateY(-${audioVolume * 3}px)`
              : 'scale(1) translateY(0px)'
          }}
        >
          <div
            className={`relative max-w-full max-h-[220px] rounded-sm transition-all duration-75 overflow-hidden flex items-center justify-center ${
              isSpeaking ? 'border-2 border-[#FF4F00]' : 'border-2 border-transparent'
            }`}
            style={{
              boxShadow: isSpeaking
                ? `0px 0px ${Math.round(8 + audioVolume * 16)}px rgba(255, 79, 0, ${0.45 + audioVolume * 0.45})`
                : 'none'
            }}
          >
            {/* Uncropped full portrait */}
            <img
              src={activeImageSource}
              alt={selectedPersona.name}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                maxHeight: '220px'
              }}
              className="contrast-110 drop-shadow-sm select-none"
            />

            {/* Lip-sync animated reactive mouth aperture during speech */}
            {isSpeaking && (
              <div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 w-8 bg-[#FF4F00] transition-all duration-75 rounded-full pointer-events-none"
                style={{
                  height: `${Math.max(3, mouthOpen * 14)}px`,
                  opacity: 0.85 + audioVolume * 0.15,
                  boxShadow: `0px 0px ${Math.round(4 + mouthOpen * 8)}px #FF4F00`
                }}
              />
            )}
          </div>
        </div>

        {/* Live Audio State Beacon */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] bg-[#FFFFFF] border border-[#111111] px-1.5 py-0.5 shadow-sm z-10">
          <span
            className={`w-2 h-2 ${
              isSpeaking
                ? 'bg-[#FF4F00] animate-ping'
                : isDuplexActive
                ? 'bg-[#008A4B]'
                : 'bg-[#767676]'
            }`}
          />
          <span className="font-bold text-[9px]">
            {isSpeaking ? 'VOCALIZING' : isDuplexActive ? 'LIP-SYNC READY' : 'STANDBY'}
          </span>
        </div>

        {/* 60fps Frame Metric */}
        <div className="absolute top-2 right-2 text-[9px] font-bold bg-[#FFFFFF]/90 px-1 border border-[#111111] z-10">
          60 FPS // MP4 SYNC
        </div>
      </div>

      {/* Active Voice Status Badge Underneath Viewport */}
      <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 bg-[#FFFFFF] border border-[#111111] text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 ${
              isSpeaking ? 'bg-[#FF4F00] animate-ping' : 'bg-[#008A4B] animate-pulse'
            }`}
          />
          <span className="font-bold tracking-wider text-[#111111]">
            ACTIVE VOICE:{' '}
            <span className="text-[#FF4F00] font-bold">
              {selectedPersona.voice.toUpperCase()}
            </span>{' '}
            [HIGGS-REALTIME]
          </span>
        </div>
        <span className="text-[9px] text-[#767676] font-bold uppercase">
          {selectedPersona.name.toUpperCase()} // {selectedPersona.role}
        </span>
      </div>

      {/* Upload Custom Portrait Button */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/webp,image/jpeg"
          onChange={handlePortraitUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#FFFFFF] hover:bg-[#F4F3EF] border border-[#111111] shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-[10px] font-bold uppercase tracking-wider"
        >
          <Upload className="w-3 h-3 text-[#FF4F00]" />
          <span>{customPortraitUrl ? 'Swap Custom Face (PNG)' : 'Upload Custom Avatar (PNG)'}</span>
        </button>

        {customPortraitUrl && (
          <button
            onClick={() => setCustomPortraitUrl(null)}
            className="py-1.5 px-2 bg-[#FFFFFF] hover:bg-[#F4F3EF] border border-[#111111] text-[10px] font-bold"
            title="Reset to selected preset"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

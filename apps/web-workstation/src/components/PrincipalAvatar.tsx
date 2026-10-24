import React, { useState, useRef, useEffect } from 'react';
import { User, Upload, Video, Sparkles, Volume2, Shield, Check } from 'lucide-react';

export interface AvatarPersona {
  id: string;
  name: string;
  role: string;
  voice: string;
  avatarUrl: string;
}

export const AVATAR_PERSONAS: AvatarPersona[] = [
  {
    id: 'chloe',
    name: 'Chloe',
    role: 'Event Director',
    voice: 'chloe',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Lead Architect',
    voice: 'marcus',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'oliver',
    name: 'Oliver',
    role: 'Travel Guide',
    voice: 'oliver',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'emma',
    name: 'Emma',
    role: 'Life Coach',
    voice: 'emma',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'liam',
    name: 'Liam',
    role: 'Startup Mentor',
    voice: 'liam',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80'
  }
];

interface PrincipalAvatarProps {
  isSpeaking: boolean;
  isDuplexActive: boolean;
  audioSource?: { getTimeDomainData: (target: Uint8Array) => void } | null;
  onSelectAvatar?: (persona: AvatarPersona) => void;
}

export function PrincipalAvatar({ isSpeaking, isDuplexActive, audioSource, onSelectAvatar }: PrincipalAvatarProps) {
  const [activePersona, setActivePersona] = useState<AvatarPersona>(AVATAR_PERSONAS[0]);
  const [customPortraitUrl, setCustomPortraitUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 60fps WebAudio Lip-Sync Reactive Animator during Realtime voice turns
  useEffect(() => {
    const dataArray = new Uint8Array(128);

    const updateMouth = () => {
      if (isSpeaking && audioSource) {
        audioSource.getTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += Math.abs(dataArray[i] - 128);
        }
        const avg = sum / dataArray.length;
        const aperture = Math.min(1, avg / 35);
        setMouthOpen(aperture);
      } else {
        setMouthOpen(0);
      }
      animFrameRef.current = requestAnimationFrame(updateMouth);
    };

    updateMouth();

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSpeaking, audioSource]);

  const handleSelectPersona = (persona: AvatarPersona) => {
    setActivePersona(persona);
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
          ...activePersona,
          avatarUrl: result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const currentDisplayImage = customPortraitUrl || activePersona.avatarUrl;

  return (
    <div className="border border-[#111111] bg-[#FFFFFF] shadow-cad p-3 text-xs font-mono">
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#FF4F00] inline-block" />
          <span className="font-bold tracking-wider text-[11px] uppercase">
            [01 // AI ADVISOR AVATAR]
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-[#F4F3EF] border border-[#111111] px-1.5 py-0.5">
          <span className="font-bold uppercase text-[#FF4F00]">{activePersona.name}</span>
          <span className="text-[#767676]">({activePersona.voice})</span>
        </div>
      </div>

      {/* 5-Avatar 1-Click Carousel */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[9px] text-[#767676] mb-1 font-bold uppercase tracking-wider">
          <span>SELECT ADVISOR PERSONA:</span>
          <span className="text-[#008A4B]">{activePersona.role}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#F4F3EF] border border-[#111111]">
          {AVATAR_PERSONAS.map((p) => {
            const isSelected = !customPortraitUrl && activePersona.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPersona(p)}
                className={`relative flex flex-col items-center gap-0.5 p-1 transition-all ${
                  isSelected
                    ? 'bg-[#FFFFFF] border border-[#FF4F00] shadow-cad-sm scale-105'
                    : 'border border-transparent hover:border-[#111111] opacity-75 hover:opacity-100'
                }`}
                title={`${p.name} — ${p.role} (Boson Voice: ${p.voice})`}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#111111] bg-[#E2E0D8]">
                  <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] font-bold text-[#111111] truncate max-w-[42px]">{p.name}</span>
                {isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF4F00] rounded-full border border-[#FFFFFF]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Viewport / Lip-Sync Portrait */}
      <div className="relative w-full h-36 bg-[#F4F3EF] border border-[#111111] flex items-center justify-center overflow-hidden">
        {/* Background drafting grid */}
        <div className="absolute inset-0 blueprint-dots pointer-events-none" />

        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={currentDisplayImage}
            alt={activePersona.name}
            className="w-full h-full object-cover grayscale contrast-115"
          />
          {/* Lip-sync animated mouth reaction overlay */}
          {isSpeaking && (
            <div
              className="absolute bottom-6 w-9 bg-[#FF4F00] transition-all duration-75 rounded-full shadow-[0px_0px_8px_#FF4F00]"
              style={{
                height: `${Math.max(3, mouthOpen * 16)}px`,
                opacity: 0.85
              }}
            />
          )}
        </div>

        {/* Live Audio State Beacon */}
        <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[10px] bg-[#FFFFFF] border border-[#111111] px-1.5 py-0.5">
          <span className={`w-2 h-2 ${isSpeaking ? 'bg-[#FF4F00] animate-ping' : isDuplexActive ? 'bg-[#008A4B]' : 'bg-[#767676]'}`} />
          <span className="font-bold text-[9px]">
            {isSpeaking ? 'VOCALIZING' : isDuplexActive ? 'LIP-SYNC READY' : 'STANDBY'}
          </span>
        </div>

        {/* Active persona role label */}
        <div className="absolute top-1.5 right-2 text-[9px] font-bold bg-[#FFFFFF]/90 px-1 border border-[#111111]">
          {activePersona.role.toUpperCase()}
        </div>
      </div>

      {/* Upload Portrait Action Button */}
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
          <span>{customPortraitUrl ? 'Swap Custom Face (PNG)' : 'Upload Custom Face (PNG)'}</span>
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

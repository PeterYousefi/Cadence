import React, { useState, useRef, useEffect } from 'react';
import { User, Upload, Video, Sparkles, Volume2, Shield } from 'lucide-react';

interface PrincipalAvatarProps {
  isSpeaking: boolean;
  isDuplexActive: boolean;
  audioSource?: { getTimeDomainData: (target: Uint8Array) => void } | null;
}

export function PrincipalAvatar({ isSpeaking, isDuplexActive, audioSource }: PrincipalAvatarProps) {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
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

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPortraitUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-[#111111] bg-[#FFFFFF] shadow-cad p-3 text-xs font-mono">
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#FF4F00] inline-block" />
          <span className="font-bold tracking-wider text-[11px] uppercase">
            [01 // PRINCIPAL ARCHITECT AVATAR]
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-[#F4F3EF] border border-[#111111] px-1.5 py-0.5">
          <span className="font-bold">HIGGS-AVATAR</span>
        </div>
      </div>

      {/* Video Viewport / Lip-Sync Portrait */}
      <div className="relative w-full h-36 bg-[#F4F3EF] border border-[#111111] flex items-center justify-center overflow-hidden">
        {/* Background drafting grid */}
        <div className="absolute inset-0 blueprint-dots pointer-events-none" />

        {portraitUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={portraitUrl}
              alt="Custom Architect Portrait"
              className="w-full h-full object-cover grayscale contrast-125"
            />
            {/* Lip-sync animated indicator overlay */}
            {isSpeaking && (
              <div
                className="absolute bottom-6 w-8 h-3 bg-[#FF4F00] transition-all duration-75 rounded-full"
                style={{
                  height: `${Math.max(3, mouthOpen * 14)}px`,
                  opacity: 0.85
                }}
              />
            )}
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center">
            {/* Industrial SVG Stylized Architect Persona */}
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <rect x="25" y="20" width="50" height="45" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
              {/* Visor / Eyes */}
              <rect x="35" y="32" width="30" height="8" fill={isSpeaking ? "#FF4F00" : "#111111"} />
              {/* Animated mouth */}
              <rect
                x="42"
                y="50"
                width="16"
                height={isSpeaking ? Math.max(3, mouthOpen * 10) : 3}
                fill="#111111"
              />
              {/* Collar & Neck */}
              <path d="M 15 85 L 35 65 L 65 65 L 85 85 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
              <line x1="50" y1="65" x2="50" y2="85" stroke="#111111" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Live Audio State Beacon */}
        <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[10px] bg-[#FFFFFF] border border-[#111111] px-1.5 py-0.5">
          <span className={`w-2 h-2 ${isSpeaking ? 'bg-[#FF4F00] animate-ping' : isDuplexActive ? 'bg-[#008A4B]' : 'bg-[#767676]'}`} />
          <span className="font-bold text-[9px]">
            {isSpeaking ? 'VOCALIZING' : isDuplexActive ? 'LIP-SYNC READY' : 'STANDBY'}
          </span>
        </div>

        {/* 60fps Frame Metric */}
        <div className="absolute top-1.5 right-2 text-[9px] font-bold text-[#767676]">
          60 FPS // MP4 SYNC
        </div>
      </div>

      {/* Upload Portrait Action Button */}
      <div className="mt-2.5 flex items-center gap-2">
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
          <span>{portraitUrl ? 'Swap Portrait (PNG/WEBP)' : 'Upload Custom Engineer (PNG)'}</span>
        </button>

        {portraitUrl && (
          <button
            onClick={() => setPortraitUrl(null)}
            className="py-1.5 px-2 bg-[#FFFFFF] hover:bg-[#F4F3EF] border border-[#111111] text-[10px] font-bold"
            title="Reset to Default Persona"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

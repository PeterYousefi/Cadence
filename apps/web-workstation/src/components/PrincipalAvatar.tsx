import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Activity, Volume2, Shield } from 'lucide-react';

export interface Persona {
  id: string;
  name: string;
  role: string;
  voice: string;
  color: string;
  image?: string;
  avatarUrl?: string;
}

export type AvatarPersona = Persona;

export const PERSONAS: Persona[] = [
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Lead Architect',
    voice: 'marcus',
    color: '#FF4F00'
  },
  {
    id: 'chloe',
    name: 'Chloe',
    role: 'UX Specialist',
    voice: 'chloe',
    color: '#008A4B'
  },
  {
    id: 'oliver',
    name: 'Oliver',
    role: 'Backend Engineer',
    voice: 'oliver',
    color: '#D97706'
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Data Scientist',
    voice: 'sophia',
    color: '#2563EB'
  },
  {
    id: 'liam',
    name: 'Liam',
    role: 'DevOps Lead',
    voice: 'liam',
    color: '#7C3AED'
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
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [mouthOpen, setMouthOpen] = useState<number>(0);
  const [fftBins, setFftBins] = useState<number[]>([0, 0, 0, 0, 0]);

  const animFrameRef = useRef<number | null>(null);

  // Sync internal selectedPersona if externally passed
  useEffect(() => {
    if (externalSelectedPersona) {
      setSelectedPersona(externalSelectedPersona);
    }
  }, [externalSelectedPersona]);

  // 60 FPS WebAudio Analyser: Continuously sample speech volume & FFT frequencies
  useEffect(() => {
    const freqData = new Uint8Array(64);
    const timeData = new Uint8Array(64);

    const sampleAudio = () => {
      if (isSpeaking && audioSource) {
        if (audioSource.getFrequencyData) {
          audioSource.getFrequencyData(freqData);
        }
        audioSource.getTimeDomainData(timeData);

        // Vocal frequency volume average
        let freqSum = 0;
        for (let i = 0; i < 32; i++) {
          freqSum += freqData[i];
        }
        const freqAvg = freqSum / 32;
        const normVol = Math.min(1, Math.max(0, freqAvg / 115));

        // Time domain RMS deviation for aperture
        let timeSum = 0;
        for (let i = 0; i < timeData.length; i++) {
          timeSum += Math.abs(timeData[i] - 128);
        }
        const timeAvg = timeSum / timeData.length;
        const normAperture = Math.min(1, Math.max(0, timeAvg / 28));

        // 5 equalizer bins for internal mouth sound blades
        const bins = [
          Math.min(1, (freqData[2] || 0) / 180),
          Math.min(1, (freqData[5] || 0) / 160),
          Math.min(1, (freqData[8] || 0) / 150),
          Math.min(1, (freqData[12] || 0) / 140),
          Math.min(1, (freqData[16] || 0) / 130)
        ];

        setAudioVolume(normVol);
        setMouthOpen(Math.max(normAperture, normVol * 0.85));
        setFftBins(bins);
      } else {
        // Return smoothly to resting state
        setAudioVolume(0);
        setMouthOpen(0);
        setFftBins([0, 0, 0, 0, 0]);
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
    if (onSelectAvatar) {
      onSelectAvatar(persona);
    }
  };

  const themeColor = selectedPersona.color || '#FF4F00';

  // Real-time kinematic mouth aperture sizing
  const mouthWidth = 26 + mouthOpen * 22; // 26px to 48px
  const mouthHeight = 2 + mouthOpen * 14; // 2px to 16px

  return (
    <div className="border border-[#111111] bg-[#FFFFFF] shadow-cad p-3 text-xs font-mono">
      {/* 1. Header: Neural Synthesis Interface Designation */}
      <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" style={{ color: themeColor }} />
          <span className="font-bold tracking-wider text-[10.5px] uppercase">
            [01 // NEURAL SYNTHESIS INTERFACE - KINEMATIC NODE]
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-[#F4F3EF] border border-[#111111] px-1.5 py-0.5">
          <span className="font-bold uppercase" style={{ color: themeColor }}>
            {selectedPersona.name}
          </span>
          <span className="text-[#767676]">({selectedPersona.voice})</span>
        </div>
      </div>

      {/* 2. Interactive Persona Mapping (5 Sci-Fi Persona Tabs) */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-[9px] text-[#767676] mb-1 font-bold uppercase tracking-wider">
          <span>SELECT SYNTHESIS PERSONA:</span>
          <span className="font-bold" style={{ color: themeColor }}>
            {selectedPersona.role}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#F4F3EF] border border-[#111111]">
          {PERSONAS.map((p) => {
            const isSelected = selectedPersona.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPersona(p)}
                className={`py-1.5 px-0.5 flex flex-col items-center justify-center border transition-all text-center ${
                  isSelected
                    ? 'bg-[#111111] text-[#FFFFFF] border-[#111111] shadow-cad-sm scale-[1.02]'
                    : 'bg-[#FFFFFF] text-[#111111] border-[#111111]/30 hover:border-[#111111] hover:bg-[#F4F3EF]'
                }`}
                title={`${p.name} — ${p.role} (Voice: ${p.voice})`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-[9px] font-bold tracking-wide truncate max-w-[48px]">
                    {p.name.toUpperCase()}
                  </span>
                </div>
                <span className="text-[7px] text-[#767676] truncate max-w-[48px] uppercase">
                  {p.voice}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cybernetic Vector Robot Face Viewport */}
      <div className="relative w-full h-64 bg-[#F4F3EF] border-2 border-[#111111] flex items-center justify-center p-2 overflow-hidden select-none">
        {/* Architectural drafting background dots */}
        <div className="absolute inset-0 blueprint-dots pointer-events-none opacity-40" />

        {/* Ambient Corner Crosshairs & Telemetry */}
        <div className="absolute top-2 left-2 text-[8px] text-[#767676] font-mono leading-none">
          + NODE.01 // REVB
        </div>
        <div className="absolute top-2 right-2 text-[8px] font-mono font-bold bg-[#FFFFFF]/90 px-1 border border-[#111111]">
          60 FPS // SVG KINEMATICS
        </div>
        <div className="absolute bottom-2 right-2 text-[8px] text-[#767676] font-mono leading-none">
          RMS: {audioVolume.toFixed(3)}
        </div>

        {/* Head Kinematic Container: Bobbing and scale pulse synced to audio */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: isSpeaking
              ? `scale(${1 + audioVolume * 0.03}) translateY(-${audioVolume * 3}px)`
              : 'scale(1) translateY(0px)'
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full max-h-[230px] filter drop-shadow-sm"
          >
            <defs>
              {/* Ocular Visor Glow Filter */}
              <filter id="visor-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Mouth Glow Filter */}
              <filter id="mouth-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Concentric Radar HUD Rings */}
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="#111111"
              strokeWidth="0.75"
              strokeDasharray="3 3"
              opacity="0.25"
            />
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="#111111"
              strokeWidth="0.5"
              opacity="0.2"
            />

            {/* Radar Crosshair Ticks */}
            <line x1="100" y1="5" x2="100" y2="12" stroke="#111111" strokeWidth="1" opacity="0.4" />
            <line x1="100" y1="188" x2="100" y2="195" stroke="#111111" strokeWidth="1" opacity="0.4" />
            <line x1="5" y1="100" x2="12" y2="100" stroke="#111111" strokeWidth="1" opacity="0.4" />
            <line x1="188" y1="100" x2="195" y2="100" stroke="#111111" strokeWidth="1" opacity="0.4" />

            {/* Neck & Collar Base Interface */}
            <polygon
              points="78,168 122,168 135,195 65,195"
              fill="#1C1B1A"
              stroke="#111111"
              strokeWidth="1.5"
            />
            <rect
              x="73"
              y="172"
              width="6"
              height="18"
              rx="1"
              fill="#2E2C2A"
              stroke="#111111"
              strokeWidth="0.75"
            />
            <rect
              x="121"
              y="172"
              width="6"
              height="18"
              rx="1"
              fill="#2E2C2A"
              stroke="#111111"
              strokeWidth="0.75"
            />
            <line
              x1="94"
              y1="172"
              x2="94"
              y2="192"
              stroke={themeColor}
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="106"
              y1="172"
              x2="106"
              y2="192"
              stroke={themeColor}
              strokeWidth="1"
              opacity="0.5"
            />

            {/* Lateral Ear Modules / Antenna Fins */}
            <polygon
              points="42,78 32,88 32,122 42,130"
              fill="#1A1918"
              stroke="#111111"
              strokeWidth="1.5"
            />
            <line x1="34" y1="96" x2="40" y2="96" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.4" />
            <line x1="34" y1="102" x2="40" y2="102" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.4" />
            <line x1="34" y1="108" x2="40" y2="108" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.4" />

            <polygon
              points="158,78 168,88 168,122 158,130"
              fill="#1A1918"
              stroke="#111111"
              strokeWidth="1.5"
            />
            <line x1="160" y1="96" x2="166" y2="96" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.4" />
            <line x1="160" y1="102" x2="166" y2="102" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.4" />
            <line x1="160" y1="108" x2="166" y2="108" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.4" />

            {/* Outer Geometric Helmet Frame (Stark Carbon Black) */}
            <polygon
              points="100,24 138,34 158,65 160,92 156,126 138,154 116,172 84,172 62,154 44,126 40,92 42,65 62,34"
              fill="#1A1918"
              stroke="#111111"
              strokeWidth="2"
            />

            {/* Inner Faceplate Inlay (Warm Alabaster) */}
            <polygon
              points="70,56 130,56 146,76 146,116 128,146 112,162 88,162 72,146 54,116 54,76"
              fill="#F4F3EF"
              stroke="#111111"
              strokeWidth="1.5"
            />

            {/* Forehead Technical Seam Lines & Markings */}
            <line x1="82" y1="56" x2="82" y2="70" stroke="#111111" strokeWidth="0.75" />
            <line x1="118" y1="56" x2="118" y2="70" stroke="#111111" strokeWidth="0.75" />
            <text x="87" y="65" fontSize="4.5" fill="#767676" fontWeight="bold">
              // SYS-01
            </text>

            {/* Central Ocular Visor Socket */}
            <polygon
              points="56,76 144,76 148,104 52,104"
              fill="#111111"
              stroke="#111111"
              strokeWidth="1.5"
            />
            <rect
              x="58"
              y="78"
              width="84"
              height="24"
              rx="1.5"
              fill="#0A0A0A"
              stroke="#222222"
              strokeWidth="0.75"
            />

            {/* Twin Glowing Ocular Visor Lenses */}
            <polygon
              points="64,84 94,84 92,96 66,96"
              fill="#141414"
              stroke={themeColor}
              strokeWidth="1"
            />
            <polygon
              points="106,84 136,84 134,96 108,96"
              fill="#141414"
              stroke={themeColor}
              strokeWidth="1"
            />

            {/* Visor Real-Time Scanline & Ocular Frequency Pulses */}
            {isSpeaking ? (
              <g filter="url(#visor-glow)">
                {/* Active audio scanning laser line */}
                <line
                  x1="62"
                  y1="90"
                  x2="138"
                  y2="90"
                  stroke={themeColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={0.8 + audioVolume * 0.2}
                />
                {/* Left eye mini frequency bars */}
                <rect x="70" y={90 - fftBins[0] * 5} width="2" height={fftBins[0] * 10 || 2} fill={themeColor} />
                <rect x="74" y={90 - fftBins[1] * 5} width="2" height={fftBins[1] * 10 || 2} fill={themeColor} />
                <rect x="78" y={90 - fftBins[2] * 6} width="2" height={fftBins[2] * 12 || 2} fill={themeColor} />
                <rect x="82" y={90 - fftBins[3] * 5} width="2" height={fftBins[3] * 10 || 2} fill={themeColor} />
                <rect x="86" y={90 - fftBins[4] * 5} width="2" height={fftBins[4] * 10 || 2} fill={themeColor} />

                {/* Right eye mini frequency bars */}
                <rect x="112" y={90 - fftBins[4] * 5} width="2" height={fftBins[4] * 10 || 2} fill={themeColor} />
                <rect x="116" y={90 - fftBins[3] * 5} width="2" height={fftBins[3] * 10 || 2} fill={themeColor} />
                <rect x="120" y={90 - fftBins[2] * 6} width="2" height={fftBins[2] * 12 || 2} fill={themeColor} />
                <rect x="124" y={90 - fftBins[1] * 5} width="2" height={fftBins[1] * 10 || 2} fill={themeColor} />
                <rect x="128" y={90 - fftBins[0] * 5} width="2" height={fftBins[0] * 10 || 2} fill={themeColor} />
              </g>
            ) : (
              <g>
                {/* Resting standby ocular beacon lines */}
                <line
                  x1="68"
                  y1="90"
                  x2="90"
                  y2="90"
                  stroke={themeColor}
                  strokeWidth="1.5"
                  opacity={isDuplexActive ? 0.9 : 0.4}
                />
                <line
                  x1="110"
                  y1="90"
                  x2="132"
                  y2="90"
                  stroke={themeColor}
                  strokeWidth="1.5"
                  opacity={isDuplexActive ? 0.9 : 0.4}
                />
              </g>
            )}

            {/* Central Nasal Bridge Sensor */}
            <polygon points="98,110 102,110 100,118" fill="#111111" />

            {/* Symmetrical Acoustic Cheek Grills */}
            <g stroke="#111111" strokeWidth="1.25">
              <line x1="68" y1="126" x2="80" y2="126" />
              <line x1="69" y1="131" x2="79" y2="131" />
              <line x1="71" y1="136" x2="78" y2="136" />

              <line x1="120" y1="126" x2="132" y2="126" />
              <line x1="121" y1="131" x2="131" y2="131" />
              <line x1="122" y1="136" x2="129" y2="136" />
            </g>

            {/* Mouth Outer Housing Frame */}
            <polygon
              points="74,138 126,138 130,158 70,158"
              fill="#111111"
              stroke="#111111"
              strokeWidth="1"
            />

            {/* REAL-TIME KINEMATIC VECTOR MOUTH */}
            {isSpeaking ? (
              <g filter="url(#mouth-glow)">
                {/* Dynamic Morphing Mouth Cavity */}
                <path
                  d={`M ${100 - mouthWidth / 2} 148 Q 100 ${148 - mouthHeight} ${100 + mouthWidth / 2} 148 Q 100 ${148 + mouthHeight} ${100 - mouthWidth / 2} 148 Z`}
                  fill="#0A0A0A"
                  stroke={themeColor}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Internal Kinematic Vocal Equalizer Blades */}
                <rect
                  x="88"
                  y={148 - Math.min(mouthHeight * 0.7, fftBins[1] * 7)}
                  width="2.5"
                  height={Math.min(mouthHeight * 1.4, Math.max(2, fftBins[1] * 14))}
                  rx="1"
                  fill={themeColor}
                  opacity="0.9"
                />
                <rect
                  x="94"
                  y={148 - Math.min(mouthHeight * 0.8, fftBins[2] * 9)}
                  width="2.5"
                  height={Math.min(mouthHeight * 1.6, Math.max(2, fftBins[2] * 18))}
                  rx="1"
                  fill={themeColor}
                  opacity="0.95"
                />
                <rect
                  x="100"
                  y={148 - Math.min(mouthHeight * 0.9, (audioVolume || 0.4) * 11)}
                  width="2.5"
                  height={Math.min(mouthHeight * 1.8, Math.max(3, (audioVolume || 0.4) * 22))}
                  rx="1"
                  fill="#FFFFFF"
                />
                <rect
                  x="106"
                  y={148 - Math.min(mouthHeight * 0.8, fftBins[3] * 9)}
                  width="2.5"
                  height={Math.min(mouthHeight * 1.6, Math.max(2, fftBins[3] * 18))}
                  rx="1"
                  fill={themeColor}
                  opacity="0.95"
                />
                <rect
                  x="112"
                  y={148 - Math.min(mouthHeight * 0.7, fftBins[4] * 7)}
                  width="2.5"
                  height={Math.min(mouthHeight * 1.4, Math.max(2, fftBins[4] * 14))}
                  rx="1"
                  fill={themeColor}
                  opacity="0.9"
                />
              </g>
            ) : (
              <g>
                {/* Resting Mouth: Sleek Segmented Horizontal Aperture */}
                <line
                  x1="82"
                  y1="148"
                  x2="118"
                  y2="148"
                  stroke={themeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity={isDuplexActive ? 0.8 : 0.4}
                />
                <line x1="82" y1="145" x2="82" y2="151" stroke={themeColor} strokeWidth="1" opacity="0.6" />
                <line x1="118" y1="145" x2="118" y2="151" stroke={themeColor} strokeWidth="1" opacity="0.6" />
              </g>
            )}

            {/* Chin Hydraulic Joint Plate */}
            <polygon points="90,164 110,164 105,170 95,170" fill="#2E2C2A" stroke="#111111" strokeWidth="0.75" />
          </svg>
        </div>

        {/* Live Audio State Beacon */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] bg-[#FFFFFF] border border-[#111111] px-1.5 py-0.5 shadow-sm z-10">
          <span
            className={`w-2 h-2 ${
              isSpeaking
                ? 'animate-ping'
                : isDuplexActive
                ? 'bg-[#008A4B]'
                : 'bg-[#767676]'
            }`}
            style={{ backgroundColor: isSpeaking ? themeColor : undefined }}
          />
          <span className="font-bold text-[9px]">
            {isSpeaking ? 'VOCALIZING' : isDuplexActive ? 'LIP-SYNC READY' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* 4. Live Telemetry Sub-Badge Underneath Viewport */}
      <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 bg-[#FFFFFF] border border-[#111111] text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 ${
              isSpeaking ? 'animate-ping' : 'bg-[#008A4B] animate-pulse'
            }`}
            style={{ backgroundColor: isSpeaking ? themeColor : '#008A4B' }}
          />
          <span className="font-bold tracking-wider text-[#111111]">
            {isSpeaking ? (
              <span className="font-bold" style={{ color: themeColor }}>
                [SYNTHESIS: ACTIVE // KINEMATIC LIPSYNC]
              </span>
            ) : isDuplexActive ? (
              <span>[SYNTHESIS: MONITORING // READY]</span>
            ) : (
              <span className="text-[#767676]">[SYNTHESIS: STANDBY // RESTING]</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-[#767676] font-bold uppercase">
          <Volume2 className="w-3 h-3 text-[#111111]" />
          <span>VOICE: {selectedPersona.voice.toUpperCase()}</span>
        </div>
      </div>

      {/* 5. HUD Designation Footer */}
      <div className="mt-1 flex items-center justify-between px-2 py-1 bg-[#F4F3EF] border border-[#111111] text-[9px] text-[#767676]">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-[#111111]" />
          <span className="font-bold text-[#111111]">NODE:</span>
          <span>{selectedPersona.name.toUpperCase()} // {selectedPersona.role.toUpperCase()}</span>
        </div>
        <span className="font-bold text-[#111111]">HIGGS-REALTIME</span>
      </div>
    </div>
  );
}

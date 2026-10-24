import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Copy, 
  Check, 
  Code, 
  Download, 
  Sparkles, 
  Layers, 
  Eye, 
  Terminal 
} from 'lucide-react';

interface ArchitectCanvasProps {
  svgContent: string;
  mermaidCode: string;
  isRendering: boolean;
  lastSummary?: string;
  highlightedComponent?: string;
  onManualUpdateCode?: (newCode: string) => void;
}

export function ArchitectCanvas({
  svgContent,
  mermaidCode,
  isRendering,
  lastSummary,
  highlightedComponent,
  onManualUpdateCode
}: ArchitectCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);
  const [editableCode, setEditableCode] = useState<string>(mermaidCode);

  useEffect(() => {
    setEditableCode(mermaidCode);
  }, [mermaidCode]);

  // Center diagram when new diagram is rendered
  useEffect(() => {
    if (svgContent) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [svgContent]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('textarea') || target.closest('.no-pan')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, +(z - 0.15).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(2.5, Math.max(0.3, +(z + delta).toFixed(2))));
    }
  };

  // Copy Spec
  const handleCopySpec = async () => {
    if (!mermaidCode) return;
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy spec', err);
    }
  };

  // Download SVG
  const handleDownloadSvg = () => {
    const svgEl = document.querySelector('.mermaid-diagram-container svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `cadence-spec-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handleApplyEdit = () => {
    if (onManualUpdateCode) {
      onManualUpdateCode(editableCode);
      setIsCodeDrawerOpen(false);
    }
  };

  return (
    <main
      className="relative flex-1 h-full bg-zinc-950 overflow-hidden select-none flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* High-tech Canvas Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Top Right "Copy Spec" & Zoom Toolbar */}
      <div className="absolute top-4 right-4 z-30">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md shadow-2xl text-xs font-mono">
          {/* Zoom Buttons */}
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="px-2 py-0.5 text-[11px] font-semibold text-zinc-300 min-w-[48px] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

          {/* Reset / Fit */}
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Fit to Workstation"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

          {/* Code Spec Inspector Toggle */}
          <button
            onClick={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isCodeDrawerOpen ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
            title="View / Edit Mermaid Spec"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Copy Spec Button */}
          <button
            onClick={handleCopySpec}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 transition-colors border border-zinc-700/50"
            title="Copy Raw Spec to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-semibold">Copy Spec</span>
              </>
            )}
          </button>

          {/* Download SVG */}
          <button
            onClick={handleDownloadSvg}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Export Vector SVG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Left Spec Badge & Node Target */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2 max-w-lg">
        {lastSummary && (
          <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono backdrop-blur-md shadow-xl animate-fade-in">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-zinc-300 truncate font-medium">{lastSummary}</span>
          </div>
        )}

        {highlightedComponent && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs font-mono text-violet-300 backdrop-blur-md">
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Target Node: <strong>{highlightedComponent}</strong></span>
          </div>
        )}
      </div>

      {/* Interactive SVG Diagram Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full flex items-center justify-center p-8 overflow-hidden cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
          isRendering ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {svgContent ? (
          <div
            className="mermaid-diagram-container transition-transform duration-100 ease-out flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-zinc-600 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center shadow-inner backdrop-blur-sm">
              <Terminal className="w-8 h-8 text-zinc-700 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-mono text-zinc-400 font-medium">Architect Viewport Ready</p>
              <p className="text-xs text-zinc-600 mt-1">
                Say a voice prompt or pick a preset to render an interactive system diagram
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Mermaid Spec Drawer */}
      {isCodeDrawerOpen && (
        <div className="no-pan absolute bottom-4 right-4 z-40 w-[500px] max-w-[90vw] bg-zinc-900/90 border border-zinc-700 rounded-2xl shadow-2xl p-4 backdrop-blur-md animate-slide-up">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-semibold">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Mermaid Architecture Spec</span>
            </div>
            <button
              onClick={handleApplyEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Render Spec</span>
            </button>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={11}
            className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 resize-none shadow-inner"
            placeholder="Enter Mermaid diagram code..."
          />
        </div>
      )}
    </main>
  );
}

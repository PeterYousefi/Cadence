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
  Send,
  DollarSign,
  Activity,
  Server
} from 'lucide-react';
import { estimateInfrastructureMetrics } from '../../../../packages/schema-engine/src/costEstimator';

interface ArchitectCanvasProps {
  svgContent: string;
  mermaidCode: string;
  isRendering: boolean;
  lastSummary?: string;
  highlightedComponent?: string;
  onManualUpdateCode?: (newCode: string) => void;
  onOpenTerraform?: () => void;
  onSendVoiceCommand?: (text: string) => void;
}

export function ArchitectCanvas({
  svgContent,
  mermaidCode,
  isRendering,
  lastSummary,
  highlightedComponent,
  onManualUpdateCode,
  onOpenTerraform,
  onSendVoiceCommand
}: ArchitectCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.15); // Default scaled to fill ~85%
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);
  const [editableCode, setEditableCode] = useState<string>(mermaidCode);
  const [commandInput, setCommandInput] = useState<string>('');

  useEffect(() => {
    setEditableCode(mermaidCode);
  }, [mermaidCode]);

  useEffect(() => {
    if (svgContent) {
      setZoom(1.15);
      setPan({ x: 0, y: 0 });
    }
  }, [svgContent]);

  // Compute live architecture cost & latency metrics
  const metrics = estimateInfrastructureMetrics(mermaidCode);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('textarea') || target.closest('input') || target.closest('.no-pan')) return;
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
  const handleZoomIn = () => setZoom((z) => Math.min(3.0, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)));
  const handleFitToScreen = () => {
    setZoom(1.15);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(3.0, Math.max(0.4, +(z + delta).toFixed(2))));
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
    downloadLink.download = `cadence-blueprint-${Date.now()}.svg`;
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

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    if (onSendVoiceCommand) {
      onSendVoiceCommand(commandInput.trim());
      setCommandInput('');
    }
  };

  return (
    <main
      className="relative flex-1 h-full bg-[#F4F3EF] blueprint-grid overflow-hidden select-none flex flex-col font-mono"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Left Live Infrastructure Metrics HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2 max-w-md">
        {/* Cost & P99 HUD */}
        <div className="pointer-events-auto flex items-center gap-3 p-2.5 bg-[#FFFFFF] border-2 border-[#111111] shadow-cad text-xs">
          <div className="flex items-center gap-1.5 border-r border-[#111111] pr-3">
            <DollarSign className="w-4 h-4 text-[#008A4B]" />
            <div>
              <span className="text-[9px] text-[#767676] block font-bold">EST. CLOUD COST</span>
              <span className="font-bold text-xs text-[#111111]">${metrics.monthlyCostUSD} / mo</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-r border-[#111111] pr-3">
            <Activity className="w-4 h-4 text-[#FF4F00]" />
            <div>
              <span className="text-[9px] text-[#767676] block font-bold">P99 LATENCY</span>
              <span className="font-bold text-xs text-[#111111]">{metrics.p99LatencyMs}ms</span>
            </div>
          </div>

          <div>
            <span className="text-[9px] text-[#767676] block font-bold">AVAILABILITY</span>
            <span className="font-bold text-[10px] text-[#008A4B]">{metrics.availabilityTier}</span>
          </div>
        </div>

        {/* Mutation Summary & Target Node Highlight */}
        {lastSummary && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] border border-[#111111] text-xs font-medium shadow-cad-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4F00] shrink-0" />
            <span className="truncate">{lastSummary}</span>
          </div>
        )}

        {highlightedComponent && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#FFFFFF] text-xs font-bold border border-[#111111] shadow-cad-sm">
            <span className="w-2 h-2 bg-[#FF4F00] inline-block animate-ping" />
            <span>MUTATING NODE: <span className="text-[#FF4F00] underline">{highlightedComponent}</span></span>
          </div>
        )}
      </div>

      {/* Top Right Tactile Drafting Toolbar */}
      <div className="absolute top-4 right-4 z-30">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] border-2 border-[#111111] shadow-cad text-xs">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-[#F4F3EF] border border-[#111111] text-[#111111] transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="px-2 font-bold text-xs min-w-[50px] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-[#F4F3EF] border border-[#111111] text-[#111111] transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-[#111111] mx-0.5" />

          {/* Fit to Screen */}
          <button
            onClick={handleFitToScreen}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-[#F4F3EF] border border-[#111111] font-bold text-[11px] uppercase transition-colors"
            title="Fit Schematic to Viewport"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>FIT</span>
          </button>

          {/* Edit Spec Drawer */}
          <button
            onClick={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
            className={`p-1.5 border border-[#111111] transition-colors ${
              isCodeDrawerOpen ? 'bg-[#FF4F00] text-[#FFFFFF]' : 'hover:bg-[#F4F3EF]'
            }`}
            title="View / Edit Mermaid Source"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Copy Spec Button */}
          <button
            onClick={handleCopySpec}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F3EF] border border-[#111111] font-bold text-[11px] uppercase transition-colors shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            title="Copy Raw Spec"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#008A4B]" />
                <span className="text-[#008A4B]">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY SPEC</span>
              </>
            )}
          </button>

          {/* Export SVG */}
          <button
            onClick={handleDownloadSvg}
            className="p-1.5 hover:bg-[#F4F3EF] border border-[#111111] transition-colors"
            title="Download SVG Blueprint"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Massive CAD Schematic Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full flex items-center justify-center p-8 overflow-hidden cursor-grab active:cursor-grabbing transition-opacity duration-150 ${
          isRendering ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {svgContent ? (
          <div
            className="mermaid-diagram-container flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-[#767676] gap-3">
            <div className="w-16 h-16 bg-[#FFFFFF] border-2 border-[#111111] shadow-cad flex items-center justify-center">
              <Layers className="w-8 h-8 text-[#111111] animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase font-sans text-[#111111]">Architect Viewport Standby</p>
              <p className="text-xs text-[#767676] mt-0.5">
                Speak a command or pick a preset to synthesize high-contrast CAD topology
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quick-Command Bar (Allows typed or 1-click voice turn triggers over Boson WebSocket) */}
      <div className="p-3 bg-[#FFFFFF] border-t-2 border-[#111111] shadow-[0px_-2px_0px_#111111] flex items-center justify-between gap-3 z-30">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-[10px]">
          <span className="font-bold text-[#767676] uppercase">QUICK COMMANDS:</span>
          <button
            onClick={() => onSendVoiceCommand?.("Add an Upstash Redis cache between our API gateway and user service.")}
            className="px-2 py-1 bg-[#F4F3EF] hover:bg-[#EBEAE5] border border-[#111111] font-bold shrink-0 transition-colors"
          >
            + Add Redis Cache
          </button>
          <button
            onClick={() => onSendVoiceCommand?.("Add an Apache Kafka event backbone with Schema Registry.")}
            className="px-2 py-1 bg-[#F4F3EF] hover:bg-[#EBEAE5] border border-[#111111] font-bold shrink-0 transition-colors"
          >
            + Wire Kafka Backbone
          </button>
          <button
            onClick={() => onSendVoiceCommand?.("Simulate chaos outage: kill the primary PostgreSQL cluster.")}
            className="px-2 py-1 bg-[#FEE2E2] hover:bg-[#FECACA] border border-[#DC2626] text-[#DC2626] font-bold shrink-0 transition-colors"
          >
            ⚡ Kill PostgreSQL (Chaos)
          </button>
          <button
            onClick={() => onSendVoiceCommand?.("Switch this whole architecture to global multi-region edge on Cloudflare Workers.")}
            className="px-2 py-1 bg-[#E8F5EE] hover:bg-[#D1EFE0] border border-[#008A4B] text-[#008A4B] font-bold shrink-0 transition-colors"
          >
            🌐 Migrate to Edge
          </button>
        </div>

        {/* Direct Text-to-Voice Command Input */}
        <form onSubmit={handleSendCommand} className="flex items-center gap-2 w-96 shrink-0">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type architecture prompt or speak in any language..."
            className="flex-1 px-3 py-1.5 bg-[#F4F3EF] border border-[#111111] text-xs font-mono text-[#111111] focus:outline-none focus:border-[#FF4F00]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#111111] text-[#FFFFFF] hover:bg-[#FF4F00] border border-[#111111] font-bold text-xs uppercase transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Manual Mermaid Spec Drawer */}
      {isCodeDrawerOpen && (
        <div className="no-pan absolute bottom-16 right-4 z-40 w-[520px] max-w-[90vw] bg-[#FFFFFF] border-2 border-[#111111] shadow-cad-lg p-4 font-mono animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase">
              <Eye className="w-4 h-4 text-[#FF4F00]" />
              <span>Mermaid Architecture Spec Editor</span>
            </div>
            <button
              onClick={handleApplyEdit}
              className="px-3 py-1 bg-[#FF4F00] hover:bg-[#e04500] text-[#FFFFFF] font-bold text-xs uppercase shadow-cad-sm transition-colors"
            >
              Re-render Spec
            </button>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={10}
            className="w-full bg-[#F4F3EF] border border-[#111111] p-3 text-xs text-[#111111] font-mono focus:outline-none focus:border-[#FF4F00] resize-none"
            placeholder="Enter Mermaid diagram code..."
          />
        </div>
      )}
    </main>
  );
}

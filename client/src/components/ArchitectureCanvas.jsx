import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasControls } from './CanvasControls.jsx';
import { Sparkles, Layers, AlertCircle, Eye, Check } from 'lucide-react';

export function ArchitectureCanvas({
  svgContent,
  mermaidCode,
  isRendering,
  error,
  lastSummary,
  highlightedComponent,
  onManualUpdateCode
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCodeViewOpen, setIsCodeViewOpen] = useState(false);
  const [editableCode, setEditableCode] = useState(mermaidCode);

  useEffect(() => {
    setEditableCode(mermaidCode);
  }, [mermaidCode]);

  // Reset pan and zoom to center whenever a new diagram loads
  useEffect(() => {
    if (svgContent) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [svgContent]);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('.no-pan')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e) => {
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

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(2.5, Math.max(0.3, +(z + delta).toFixed(2))));
    }
  };

  const handleApplyCodeEdit = () => {
    if (onManualUpdateCode) {
      onManualUpdateCode(editableCode);
      setIsCodeViewOpen(false);
    }
  };

  return (
    <main
      className="relative flex-1 h-full bg-zinc-950 overflow-hidden select-none flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Floating Canvas Toolbar */}
      <div className="absolute top-4 right-4 z-30">
        <CanvasControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onFitView={handleResetZoom}
          mermaidCode={mermaidCode}
          onToggleCodeView={() => setIsCodeViewOpen(!isCodeViewOpen)}
          isCodeViewOpen={isCodeViewOpen}
        />
      </div>

      {/* Top Left Topology Status Info */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5 max-w-lg">
        {lastSummary && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono backdrop-blur-md shadow-md animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-zinc-300 truncate">{lastSummary}</span>
          </div>
        )}

        {highlightedComponent && (
          <div className="pointer-events-auto flex items-center gap-2 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/30 text-[11px] font-mono text-violet-300 backdrop-blur-sm">
            <Layers className="w-3 h-3 text-pink-400" />
            <span>Target Node: <strong>{highlightedComponent}</strong></span>
          </div>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full flex items-center justify-center p-8 overflow-hidden cursor-grab active:cursor-grabbing ${
          isRendering ? 'opacity-80' : 'opacity-100'
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
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
              <Layers className="w-8 h-8 text-zinc-700 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-mono text-zinc-400">Diagram Viewport Idle</p>
              <p className="text-xs text-zinc-600 mt-1">
                Say a architecture request or pick a preset to synthesize diagram
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Mermaid Code Editor Drawer */}
      {isCodeViewOpen && (
        <div className="no-pan absolute bottom-4 right-4 z-40 w-[480px] max-w-[90vw] bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-2xl p-4 backdrop-blur-md animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-semibold">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Mermaid Definition Editor</span>
            </div>
            <button
              onClick={handleApplyCodeEdit}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-semibold text-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Render</span>
            </button>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={10}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Enter Mermaid diagram code..."
          />
        </div>
      )}
    </main>
  );
}

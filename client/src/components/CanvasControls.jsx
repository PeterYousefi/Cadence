import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Copy, Check, Code, Download } from 'lucide-react';

export function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  mermaidCode,
  onToggleCodeView,
  isCodeViewOpen
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!mermaidCode) return;
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.querySelector('.mermaid-diagram-container svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `cadence-architecture-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md shadow-lg text-xs font-mono">
      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span className="px-2 py-0.5 text-[11px] font-semibold text-zinc-300 min-w-[48px] text-center select-none">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

      {/* Reset & Fit */}
      <button
        onClick={onResetZoom}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Reset Zoom (100%)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onFitView}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Fit Diagram to View"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

      {/* Code Inspector Toggle */}
      <button
        onClick={onToggleCodeView}
        className={`p-1.5 rounded-lg transition-colors ${
          isCodeViewOpen ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        title="View / Edit Mermaid Source"
      >
        <Code className="w-4 h-4" />
      </button>

      {/* Copy Code */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
        title="Copy Raw Mermaid Code"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-[11px]">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Copy Code</span>
          </>
        )}
      </button>

      {/* Export SVG */}
      <button
        onClick={handleDownloadSvg}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Download Architecture SVG"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}

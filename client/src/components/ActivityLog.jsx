import React, { useRef, useEffect } from 'react';
import { Terminal, User, Bot, Wrench, ChevronRight, Trash2 } from 'lucide-react';

export function ActivityLog({ logs = [], onClear }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono font-medium tracking-wide text-zinc-300 uppercase">
            Full-Duplex Transcript & Tool Log
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
            {logs.length}
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors text-xs flex items-center gap-1"
            title="Clear Log"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono text-xs select-text"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-2 p-4">
            <Bot className="w-8 h-8 text-zinc-700 animate-pulse" />
            <p className="text-xs max-w-[240px]">
              Speak naturally into your microphone or choose a preset to start conversing with Cadence.
            </p>
          </div>
        ) : (
          logs.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${
                item.role === 'user'
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100'
                  : item.role === 'cadence'
                  ? 'bg-violet-950/20 border-violet-500/30 text-violet-100'
                  : item.role === 'tool'
                  ? 'bg-pink-950/20 border-pink-500/30 text-pink-100'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
              }`}
            >
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-400 opacity-80">
                <div className="flex items-center gap-1.5 font-semibold">
                  {item.role === 'user' && (
                    <>
                      <User className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-400">USER</span>
                    </>
                  )}
                  {item.role === 'cadence' && (
                    <>
                      <Bot className="w-3 h-3 text-violet-400" />
                      <span className="text-violet-400">CADENCE</span>
                    </>
                  )}
                  {item.role === 'tool' && (
                    <>
                      <Wrench className="w-3 h-3 text-pink-400" />
                      <span className="text-pink-400">TOOL CALL: {item.toolName}</span>
                    </>
                  )}
                </div>
                <span className="text-zinc-500">{item.time}</span>
              </div>

              {/* Entry Content */}
              {item.role === 'tool' ? (
                <div className="mt-1 space-y-1">
                  {item.summary && (
                    <p className="text-zinc-200 text-xs font-sans italic">
                      "{item.summary}"
                    </p>
                  )}
                  {item.highlighted_component && (
                    <div className="text-[10px] text-pink-300">
                      Modified Node: <span className="underline font-bold">{item.highlighted_component}</span>
                    </div>
                  )}
                  <details className="mt-1 bg-zinc-950/80 rounded p-1.5 border border-zinc-800/60">
                    <summary className="cursor-pointer text-[10px] text-zinc-400 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      View Mermaid Tool Payload
                    </summary>
                    <pre className="mt-1.5 text-[10px] text-zinc-300 overflow-x-auto p-1 bg-zinc-900/80 rounded border border-zinc-800">
                      {item.mermaid_code || JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="font-sans text-xs whitespace-pre-wrap">{item.text}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

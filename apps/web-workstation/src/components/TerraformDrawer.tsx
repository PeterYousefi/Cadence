import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Server } from 'lucide-react';
import { generateIaCFromMermaid } from '../../../../packages/schema-engine/src/terraformGenerator';

interface TerraformDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mermaidCode: string;
}

export function TerraformDrawer({ isOpen, onClose, mermaidCode }: TerraformDrawerProps) {
  const [activeTab, setActiveTab] = useState<'terraform' | 'docker'>('terraform');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const manifests = generateIaCFromMermaid(mermaidCode);
  const activeContent = activeTab === 'terraform' ? manifests.terraform : manifests.dockerCompose;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'terraform' ? 'main.tf' : 'docker-compose.yml';
    const blob = new Blob([activeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[540px] max-w-[90vw] bg-[#FFFFFF] border-l-2 border-[#111111] shadow-cad-lg flex flex-col font-mono text-xs select-none">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-[#111111] bg-[#F4F3EF]">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-[#FF4F00]" />
          <div>
            <h2 className="font-bold text-sm tracking-wider uppercase font-sans">
              INFRASTRUCTURE-AS-CODE MANIFESTS
            </h2>
            <p className="text-[10px] text-[#767676]">
              Synthesized from active Mermaid AST ({manifests.componentCount} components)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#FFFFFF] border border-[#111111] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#111111] bg-[#F4F3EF] px-4 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('terraform')}
          className={`px-4 py-2 text-xs font-bold border-t border-x border-[#111111] uppercase tracking-wider transition-all ${
            activeTab === 'terraform'
              ? 'bg-[#FFFFFF] text-[#FF4F00] shadow-[0px_-2px_0px_#FF4F00]'
              : 'bg-[#EBEAE5] text-[#767676] hover:bg-[#FFFFFF]'
          }`}
        >
          Terraform (main.tf)
        </button>
        <button
          onClick={() => setActiveTab('docker')}
          className={`px-4 py-2 text-xs font-bold border-t border-x border-[#111111] uppercase tracking-wider transition-all ${
            activeTab === 'docker'
              ? 'bg-[#FFFFFF] text-[#FF4F00] shadow-[0px_-2px_0px_#FF4F00]'
              : 'bg-[#EBEAE5] text-[#767676] hover:bg-[#FFFFFF]'
          }`}
        >
          docker-compose.yml
        </button>
      </div>

      {/* Code Body */}
      <div className="flex-1 p-4 bg-[#F4F3EF] overflow-y-auto">
        <pre className="p-4 bg-[#FFFFFF] border border-[#111111] shadow-inner text-[11px] leading-relaxed overflow-x-auto text-[#111111]">
          {activeContent}
        </pre>
      </div>

      {/* Actions */}
      <div className="p-4 border-t-2 border-[#111111] bg-[#F4F3EF] flex items-center justify-between">
        <div className="text-[10px] text-[#767676]">
          Ready for <code>terraform apply</code> or <code>docker compose up</code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#F4F3EF] border border-[#111111] font-bold shadow-cad-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#008A4B]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF4F00] text-[#FFFFFF] font-bold shadow-cad hover:bg-[#e04500] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD FILE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

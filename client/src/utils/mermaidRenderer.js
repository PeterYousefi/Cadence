import mermaid from 'mermaid';
import { sanitizeMermaidCode } from './mermaidParser.js';

let isInitialized = false;

export function initMermaid() {
  if (isInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Fira Code, monospace',
    themeVariables: {
      darkMode: true,
      background: '#09090b',
      primaryColor: '#1e1b4b',
      primaryTextColor: '#f4f4f5',
      primaryBorderColor: '#06b6d4',
      lineColor: '#06b6d4',
      secondaryColor: '#1e293b',
      tertiaryColor: '#0f172a',
      fontSize: '14px'
    },
    flowchart: {
      curve: 'basis',
      padding: 16,
      nodeSpacing: 50,
      rankSpacing: 50,
      htmlLabels: true
    }
  });
  isInitialized = true;
}

let counter = 0;

/**
 * Safely renders Mermaid code to SVG string.
 * @param {string} rawCode
 * @returns {Promise<{ svg: string, sanitizedCode: string }>}
 */
export async function renderMermaidSvg(rawCode) {
  initMermaid();
  const sanitizedCode = sanitizeMermaidCode(rawCode);
  const renderId = `cadence-mermaid-${Date.now()}-${counter++}`;

  try {
    const { svg } = await mermaid.render(renderId, sanitizedCode);
    return { svg, sanitizedCode, error: null };
  } catch (error) {
    // Cleanup temporary element if created by mermaid
    const tempEl = document.getElementById(renderId);
    if (tempEl) tempEl.remove();
    const dEl = document.getElementById(`d${renderId}`);
    if (dEl) dEl.remove();

    console.error('[Cadence Mermaid] Render error:', error);
    return {
      svg: null,
      sanitizedCode,
      error: error.message || 'Syntax error in Mermaid diagram definition'
    };
  }
}

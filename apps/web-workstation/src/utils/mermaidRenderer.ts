import mermaid from 'mermaid';
import { sanitizeMermaidAST } from '../../../../packages/schema-engine/src/sanitizer';

let isInitialized = false;

export function initMermaid(): void {
  if (isInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: 'Space Grotesk, sans-serif',
    themeVariables: {
      darkMode: false,
      background: '#F4F3EF',
      primaryColor: '#FFFFFF',
      primaryTextColor: '#111111',
      primaryBorderColor: '#111111',
      lineColor: '#111111',
      secondaryColor: '#F4F3EF',
      tertiaryColor: '#FFFFFF',
      fontSize: '18px'
    },
    flowchart: {
      curve: 'basis',
      padding: 24,
      nodeSpacing: 60,
      rankSpacing: 60,
      htmlLabels: true
    }
  });
  isInitialized = true;
}

let counter = 0;

export interface MermaidRenderResult {
  svg: string | null;
  sanitizedCode: string;
  error: string | null;
}

export async function renderMermaidSvg(
  rawCode: string,
  highlightedComponent?: string,
  failedComponents?: string[]
): Promise<MermaidRenderResult> {
  initMermaid();
  const sanitizedCode = sanitizeMermaidAST(rawCode, {
    highlightedComponent,
    failedComponents
  });
  const renderId = `cadence-mermaid-${Date.now()}-${counter++}`;

  try {
    const { svg } = await mermaid.render(renderId, sanitizedCode);
    return { svg, sanitizedCode, error: null };
  } catch (error: any) {
    const tempEl = document.getElementById(renderId);
    if (tempEl) tempEl.remove();
    const dEl = document.getElementById(`d${renderId}`);
    if (dEl) dEl.remove();

    console.error('[Cadence Mermaid] Render error:', error);
    return {
      svg: null,
      sanitizedCode,
      error: error?.message || 'Syntax error in Mermaid diagram definition'
    };
  }
}

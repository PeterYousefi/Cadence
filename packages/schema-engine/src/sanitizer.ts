/**
 * Mermaid AST Sanitizer and Syntax Healing Engine
 */

export interface SanitizeOptions {
  highlightedComponent?: string;
  failedComponents?: string[];
}

export function sanitizeMermaidAST(raw: string, options: SanitizeOptions = {}): string {
  if (!raw || typeof raw !== 'string') {
    return 'graph TD\n  Start([Empty Architecture])';
  }

  let code = raw.trim();

  // 1. Strip markdown fences (```mermaid ... ``` or ``` ...)
  code = code.replace(/^```(?:mermaid)?\s*/i, '');
  code = code.replace(/\s*```$/i, '');
  code = code.trim();

  // 2. Remove backticks
  code = code.replace(/`/g, '');

  // 3. Normalize Unicode smart quotes
  code = code
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  // 4. Validate or inject graph header
  const knownHeaders = [
    'graph ',
    'flowchart ',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'architecture'
  ];

  const hasHeader = knownHeaders.some((header) =>
    code.toLowerCase().startsWith(header.toLowerCase())
  );

  if (!hasHeader) {
    code = `graph TD\n  ${code}`;
  }

  // 5. Apply highlight styling (Signal Orange #FF4F00)
  if (options.highlightedComponent && code.includes(options.highlightedComponent)) {
    code += `\n  style ${options.highlightedComponent} fill:#FF4F00,stroke:#111111,stroke-width:3px,color:#FFFFFF`;
  }

  // 6. Apply chaos failure styling for failed components (Crimson Dashed)
  if (options.failedComponents && options.failedComponents.length > 0) {
    for (const failedId of options.failedComponents) {
      if (code.includes(failedId)) {
        code += `\n  style ${failedId} fill:#FEE2E2,stroke:#DC2626,stroke-width:3px,stroke-dasharray:5 5,color:#991B1B`;
      }
    }
  }

  return code;
}

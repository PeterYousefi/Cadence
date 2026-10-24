/**
 * Mermaid diagram sanitizer, validator, and formatter.
 */

/**
 * Sanitizes raw LLM output into clean, valid Mermaid.js code.
 * @param {string} raw
 * @returns {string}
 */
export function sanitizeMermaidCode(raw) {
  if (!raw || typeof raw !== 'string') {
    return 'graph TD\n  Start([Empty Architecture])';
  }

  let code = raw.trim();

  // Strip markdown code fences (```mermaid ... ``` or ``` ...)
  code = code.replace(/^```(?:mermaid)?\s*/i, '');
  code = code.replace(/\s*```$/i, '');
  code = code.trim();

  // Remove any remaining dangling backticks
  code = code.replace(/`/g, '');

  // Normalize Unicode smart quotes to standard quotes
  code = code
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  // Check if diagram has a diagram type header
  const knownHeaders = [
    'graph ',
    'flowchart ',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'journey',
    'gantt',
    'pie',
    'gitGraph',
    'mindmap',
    'timeline',
    'architecture'
  ];

  const hasHeader = knownHeaders.some((header) =>
    code.toLowerCase().startsWith(header.toLowerCase())
  );

  if (!hasHeader) {
    // If the LLM omitted the graph directive, default to graph TD
    code = `graph TD\n  ${code}`;
  }

  return code;
}

/**
 * Applies Cyberpunk theme class definitions or styling to a Mermaid graph if not already styled.
 * @param {string} code
 * @param {string} [highlightedId]
 * @returns {string}
 */
export function enhanceMermaidStyling(code, highlightedId) {
  let enhanced = code;

  if (highlightedId && code.includes(highlightedId)) {
    // Append classDef or style for the highlighted node
    enhanced += `\n  style ${highlightedId} fill:#8b5cf6,stroke:#ec4899,stroke-width:3px,color:#ffffff`;
  }

  return enhanced;
}

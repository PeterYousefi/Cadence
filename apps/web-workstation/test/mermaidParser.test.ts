import assert from 'assert';
import { sanitizeMermaidCode, enhanceMermaidStyling } from '../src/utils/mermaidParser.ts';

function testMermaidSanitizer() {
  // Test 1: Strips markdown code fences
  const fenced = '```mermaid\ngraph TD\n  A[Frontend] --> B[API Gateway]\n```';
  const sanitized = sanitizeMermaidCode(fenced);
  assert.strictEqual(sanitized, 'graph TD\n  A[Frontend] --> B[API Gateway]');

  // Test 2: Auto-prefixes graph TD if missing
  const noHeader = 'A[Client] --> B[Server]';
  const withHeader = sanitizeMermaidCode(noHeader);
  assert.ok(withHeader.startsWith('graph TD\n'));

  // Test 3: Normalizes smart quotes and removes backticks
  const backticksAndQuotes = 'graph TD\n  A[`API Router`] --> B[“Database”]\n';
  const cleaned = sanitizeMermaidCode(backticksAndQuotes);
  assert.ok(!cleaned.includes('`'));
  assert.ok(cleaned.includes('"Database"'));

  // Test 4: Enhances style for highlighted node
  const enhanced = enhanceMermaidStyling(sanitized, 'B');
  assert.ok(enhanced.includes('style B fill:#8b5cf6'));

  console.log('✅ Mermaid parser and sanitizer tests passed successfully');
}

testMermaidSanitizer();

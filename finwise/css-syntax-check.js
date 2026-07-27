const fs = require('fs');
const path = require('path');
const root = path.resolve('.');
const results = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.css')) {
      const text = fs.readFileSync(p, 'utf8');
      let line = 1;
      let depth = 0;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') line++;
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      if (depth !== 0) {
        results.push(`${p} brace depth ${depth}`);
      }
      if (text.includes('}.sip-container')) {
        results.push(`${p} contains '}.sip-container'`);
      }
      if (text.match(/\}\s*\.sip-container/)) {
        results.push(`${p} contains regex /}\\s*\\.sip-container/`);
      }
    }
  }
}
walk(root);
if (results.length === 0) {
  console.log('OK');
} else {
  console.log(results.join('\n'));
}

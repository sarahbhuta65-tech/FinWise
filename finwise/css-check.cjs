const fs = require('fs');
const path = require('path');
const root = path.resolve('.');
const problems = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.css')) {
      const text = fs.readFileSync(p, 'utf8');
      let depth = 0;
      let line = 1;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') line++;
        if (ch === '{') depth++;
        if (ch === '}') {
          depth--;
          if (depth < 0) {
            problems.push(`${p}: extra closing brace at line ${line}`);
            depth = 0;
          }
        }
      }
      if (depth !== 0) {
        problems.push(`${p}: unbalanced braces depth ${depth}`);
      }
      if (text.includes('}.sip-container')) {
        problems.push(`${p}: contains literal '}.sip-container'`);
      }
      if (/\}\s*\.sip-container/.test(text)) {
        problems.push(`${p}: matches regex /}\\s*\\.sip-container/`);
      }
    }
  }
}
walk(root);
if (problems.length === 0) {
  console.log('OK');
} else {
  console.log(problems.join('\n'));
}

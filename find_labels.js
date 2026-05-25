const fs = require('fs');
const path = require('path');
function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) search(p);
    else if (p.endsWith('.jsx')) {
      const text = fs.readFileSync(p, 'utf8');
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        if (/<(button|input|a\s|Link)[^>]*>/.test(line) && !/aria-label/.test(line)) {
          // print trimmed line, max 100 chars
          console.log(p + ':' + (i+1) + ': ' + line.trim().substring(0, 100));
        }
      });
    }
  }
}
search('src');

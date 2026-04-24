const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('registrationNumber:')) {
    let codeMatch = lines[i].match(/code:\s*'([^']+)'/);
    let code = codeMatch ? codeMatch[1].split('-')[1] : '000';
    lines[i] = lines[i].replace(/registrationNumber:\s*'[^']*'/, `registrationNumber: 'SCL-${code}', serialNumber: 'SER-${code}'`);
  }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));

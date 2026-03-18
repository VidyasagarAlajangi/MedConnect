const fs = require('fs');
const path = require('path');

function removeLogsAndComments(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Remove JSX comments: {/* ... */}
    content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
    
    // 2. Remove multi-line comments: /* ... */
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 3. Remove full-line single-line comments
    content = content.replace(/^[ \t]*\/\/.*$\r?\n?/gm, '');
    
    // 4. Remove end-of-line single-line comments (requires a space before // to protect http://)
    content = content.replace(/(?<=\s)\/\/.*$/gm, '');

    // 5. Safely filter out console statements line by line
    let lines = content.split(/\r?\n/);
    let inConsoleLog = false;
    let newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Detect the start of a multi-line console log or a single-line console log
        if (/^[ \t]*console\.(log|error|warn|info|debug|trace|table)/.test(line)) {
            // Check if it closes on the same line (naively)
            if (line.includes(');') || line.trim().endsWith(')')) {
                continue; // Skip this line entirely
            } else {
                inConsoleLog = true;
                continue; // Skip the start line and wait for it to close
            }
        }
        
        if (inConsoleLog) {
            // Check if this line closes the multi-line console log
            if (line.includes(');') || line.trim().endsWith(')') || line.trim().endsWith('),')) {
                inConsoleLog = false;
            }
            continue; // Skip the lines inside the multi-line log
        }
        
        // Remove inline console statements on regular lines
        if (line.includes('console.')) {
            line = line.replace(/console\.(log|error|warn|info|debug|trace|table)\s*\([^)]*\);?/g, '');
            // In case there is an empty space left:
            if (line.trim() === '') continue;
        }
        
        newLines.push(line);
    }
    
    content = newLines.join('\n');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            removeLogsAndComments(fullPath);
        }
    }
}

const targetDirs = ['Frontend/src', 'backend/src'];
let filesProcessed = 0;

targetDirs.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) {
        console.log(`Scanning ${dir}...`);
        traverseDir(fullDir);
    }
});

console.log("Cleanup complete!");

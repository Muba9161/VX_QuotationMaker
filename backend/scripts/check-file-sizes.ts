import fs from 'fs';
import path from 'path';

const MAX_LINES = 800;
const WARNING_THRESHOLD = 500;
const TARGETS = ['src', 'scripts', 'tests'];

interface FileCheckResult {
  file: string;
  lines: number;
}

function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      files.push(fullPath);
    }
  }

  return files;
}

function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.length === 0) return 0;
  return content.split('\n').length;
}

function runCheck(): void {
  console.log('=== Checking Application Source File Sizes ===');
  console.log(
    `Constraints: Max Allowed = ${MAX_LINES} lines | Warning Threshold = ${WARNING_THRESHOLD} lines\n`,
  );

  const baseDir = fs.existsSync(path.resolve(process.cwd(), 'src'))
    ? process.cwd()
    : path.resolve(__dirname, '..');

  const allFiles: string[] = [];
  for (const target of TARGETS) {
    allFiles.push(...getFiles(path.resolve(baseDir, target)));
  }

  const results: FileCheckResult[] = [];
  const violations: FileCheckResult[] = [];
  const warnings: FileCheckResult[] = [];

  for (const file of allFiles) {
    const lines = countLines(file);
    const relPath = path.relative(baseDir, file);
    const result = { file: relPath, lines };
    results.push(result);

    if (lines > MAX_LINES) {
      violations.push(result);
    } else if (lines > WARNING_THRESHOLD) {
      warnings.push(result);
    }
  }

  // Sort descending by line count
  results.sort((a, b) => b.lines - a.lines);

  console.log(`Scanned ${results.length} files across [${TARGETS.join(', ')}]:`);
  for (const r of results) {
    let flag = '✓ OK';
    if (r.lines > MAX_LINES) flag = '✗ EXCEEDS 800-LINE LIMIT';
    else if (r.lines > WARNING_THRESHOLD) flag = '⚠ APPROACHING LIMIT';
    console.log(`  [${r.lines.toString().padStart(4, ' ')} lines] ${flag} - ${r.file}`);
  }

  console.log('\n--- Summary ---');
  console.log(`Total files: ${results.length}`);
  console.log(`Warnings (> ${WARNING_THRESHOLD} lines): ${warnings.length}`);
  console.log(`Violations (> ${MAX_LINES} lines): ${violations.length}`);

  if (violations.length > 0) {
    console.error('\nERROR: One or more files exceed the mandatory 800-line constraint:');
    for (const v of violations) {
      console.error(`  - ${v.file}: ${v.lines} lines (exceeds ${MAX_LINES})`);
    }
    process.exit(1);
  }

  console.log('\nSuccess: All files comply with the 800-line architectural constraint.\n');
}

runCheck();

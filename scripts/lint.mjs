import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CHECKED_FOLDERS = ['src', 'supabase', 'tests', 'scripts', 'spec'];
const CHECKED_FILES = ['index.html', 'package.json', '.env.example', '.gitignore', 'README.md'];
const ALLOWED_SUFFIXES = new Set([
  '.js', '.mjs', '.ts', '.py', '.css', '.sql', '.html', '.json', '.md', '.example',
]);
const issues = [];

function getFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const entry = join(directory, item.name);
    return item.isDirectory() ? getFiles(entry) : [entry];
  });
}

const files = [
  ...CHECKED_FILES.map((file) => join(ROOT, file)),
  ...CHECKED_FOLDERS.flatMap((folder) => getFiles(join(ROOT, folder))),
];

for (const path of files) {
  const filename = relative(ROOT, path);
  const extension = extname(path);
  if (!ALLOWED_SUFFIXES.has(extension) && !CHECKED_FILES.includes(filename)) {
    continue;
  }
  const contents = readFileSync(path, 'utf8');
  const lines = contents.replace(/\n$/, '').split('\n');
  if (lines.length > 300) {
    issues.push(`${filename}: 파일 길이 ${lines.length}줄 (최대 300줄)`);
  }
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.length > 120) {
      issues.push(`${filename}:${index + 1}: ${line.length}자 (최대 120자)`);
    }
    if (line.includes('\t')) {
      issues.push(`${filename}:${index + 1}: 탭 들여쓰기 금지`);
    }
    if (/[ \t]+$/.test(line)) {
      issues.push(`${filename}:${index + 1}: 줄 끝 공백 금지`);
    }
    if (/\bconsole\.(log|dir|debug)\s*\(/.test(line)) {
      issues.push(`${filename}:${index + 1}: 디버그 콘솔 사용 금지`);
    }
  }
  if (extension === '.js' || extension === '.mjs') {
    try {
      execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' });
    } catch {
      issues.push(`${filename}: JavaScript 구문 오류`);
    }
  }
}

if (issues.length) {
  process.stderr.write(issues.join('\n') + '\n');
  process.exitCode = 1;
} else {
  process.stdout.write(`검사 완료: ${files.length}개 파일, 오류 0개, 경고 0개\n`);
}

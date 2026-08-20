import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { analyzeSources, type RecordedDecision } from './duplicate-analyzer.js';

const EXCLUDED_PATHS = [
  /(?:^|\/)test(?:\/|$)/,
  /(?:^|\/)__tests__(?:\/|$)/,
  /(?:^|\/)generated(?:\/|$)/,
  /(?:^|\/)migrations?(?:\/|$)/,
  /\.d\.ts$/,
  /\.(?:spec|test|e2e-spec)\.ts$/,
  /\.(?:dto|schema|module)\.ts$/,
];

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\.\//, '');
}

function commandLines(command: string, args: string[]): string[] {
  const output = execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return output
    .split('\n')
    .map((line) => normalizePath(line.trim()))
    .filter(Boolean);
}

function changedFiles(): Set<string> | undefined {
  try {
    const tracked = commandLines('git', ['diff', '--name-only', 'HEAD', '--', 'src']);
    const untracked = commandLines('git', [
      'ls-files',
      '--others',
      '--exclude-standard',
      '--',
      'src',
    ]);
    return new Set([...tracked, ...untracked]);
  } catch {
    return undefined;
  }
}

function isEligible(file: string): boolean {
  const normalized = normalizePath(file);
  return (
    normalized.startsWith('src/') && !EXCLUDED_PATHS.some((pattern) => pattern.test(normalized))
  );
}

function loadSources(): Map<string, string> {
  const configPath = ts.findConfigFile(
    process.cwd(),
    (fileName) => ts.sys.fileExists(fileName),
    'tsconfig.json',
  );
  if (!configPath) {
    throw new Error('Could not find tsconfig.json.');
  }
  const config = ts.readConfigFile(configPath, (fileName) => ts.sys.readFile(fileName));
  if (config.error) {
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  const sources = new Map<string, string>();
  for (const absoluteFile of parsed.fileNames) {
    const relativeFile = normalizePath(path.relative(process.cwd(), absoluteFile));
    if (isEligible(relativeFile)) {
      sources.set(relativeFile, readFileSync(absoluteFile, 'utf8'));
    }
  }
  return sources;
}

function loadDecisions(): RecordedDecision[] {
  const decisionPath = path.join(process.cwd(), '.duplicate-logic-decisions.json');
  if (!existsSync(decisionPath)) {
    return [];
  }
  const parsed: unknown = JSON.parse(readFileSync(decisionPath, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || !('decisions' in parsed)) {
    throw new Error('Invalid .duplicate-logic-decisions.json: expected a decisions array.');
  }
  const decisions = parsed.decisions;
  if (!Array.isArray(decisions) || !decisions.every(isRecordedDecision)) {
    throw new Error('Invalid .duplicate-logic-decisions.json: expected a decisions array.');
  }
  return decisions;
}

function isRecordedDecision(value: unknown): value is RecordedDecision {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return (
    'candidateId' in value &&
    typeof value.candidateId === 'string' &&
    'fingerprint' in value &&
    typeof value.fingerprint === 'string' &&
    'decision' in value &&
    (value.decision === 'keep-separate' || value.decision === 'defer') &&
    'reason' in value &&
    typeof value.reason === 'string'
  );
}

function hasFlag(flag: string): boolean {
  return process.argv.slice(2).includes(flag);
}

const sources = loadSources();
const requestedChangedScan = hasFlag('--changed');
const detectedChanges = requestedChangedScan ? changedFiles() : undefined;
const candidates = analyzeSources(sources, {
  ...(detectedChanges ? { changedFiles: detectedChanges } : {}),
  decisions: loadDecisions(),
});
const unresolved = candidates.filter((candidate) => candidate.review.status === 'unresolved');
const report = {
  version: 1,
  mode: requestedChangedScan && detectedChanges ? 'changed' : 'full',
  changedFiles: detectedChanges ? [...detectedChanges].sort() : [],
  sourceFiles: sources.size,
  candidates,
  summary: {
    unresolved: unresolved.length,
    resolved: candidates.length - unresolved.length,
  },
};

if (hasFlag('--json')) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else if (candidates.length === 0) {
  process.stdout.write('Duplicate logic review: no candidates found.\n');
} else {
  process.stdout.write(
    `Duplicate logic review: ${unresolved.length} unresolved, ${candidates.length - unresolved.length} resolved.\n`,
  );
  for (const candidate of unresolved) {
    const [left, right] = candidate.occurrences;
    process.stdout.write(
      `- ${candidate.id} ${candidate.kind} ${candidate.score}: ${left.file}:${left.startLine} ${left.symbol} <-> ${right.file}:${right.startLine} ${right.symbol}\n`,
    );
  }
}

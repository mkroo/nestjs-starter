import { createHash } from 'node:crypto';

import ts from 'typescript';

export type DuplicateDecision = 'keep-separate' | 'defer';

export interface RecordedDecision {
  candidateId: string;
  fingerprint: string;
  decision: DuplicateDecision;
  reason: string;
}

export interface FunctionOccurrence {
  file: string;
  symbol: string;
  startLine: number;
  endLine: number;
}

interface FunctionRecord {
  occurrence: FunctionOccurrence;
  strictTokens: string[];
  relaxedTokens: string[];
  strictFingerprint: string;
  relaxedFingerprint: string;
  controlFlow: string[];
  calls: string[];
}

export interface DuplicateCandidate {
  id: string;
  fingerprint: string;
  kind: 'strict-ast' | 'relaxed-ast' | 'near-ast';
  score: number;
  occurrences: [FunctionOccurrence, FunctionOccurrence];
  signals: {
    sameControlFlow: boolean;
    sharedCalls: string[];
    literalsDiffer: boolean;
  };
  review: {
    status: 'unresolved' | 'resolved';
    decision?: DuplicateDecision;
    reason?: string;
  };
}

export interface AnalyzeOptions {
  changedFiles?: ReadonlySet<string>;
  decisions?: readonly RecordedDecision[];
  minimumStatements?: number;
  minimumTokens?: number;
  similarityThreshold?: number;
}

const DEFAULT_MINIMUM_STATEMENTS = 6;
const DEFAULT_MINIMUM_TOKENS = 45;
const DEFAULT_SIMILARITY_THRESHOLD = 0.9;
const SHINGLE_SIZE = 5;

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\.\//, '');
}

function isFunctionLike(node: ts.Node): node is ts.FunctionLikeDeclaration {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node)
  );
}

function isNestedFunction(node: ts.FunctionLikeDeclaration): boolean {
  let current = node.parent;
  while (!ts.isSourceFile(current)) {
    if (isFunctionLike(current)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) {
    return [name.text];
  }
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingNames(element.name),
  );
}

function collectLocalNames(root: ts.FunctionLikeDeclaration): Map<string, string> {
  const names: string[] = root.parameters.flatMap((parameter) => bindingNames(parameter.name));

  const visit = (node: ts.Node): void => {
    if (node !== root && isFunctionLike(node)) {
      return;
    }
    if (ts.isVariableDeclaration(node)) {
      names.push(...bindingNames(node.name));
    } else if (ts.isCatchClause(node) && node.variableDeclaration) {
      names.push(...bindingNames(node.variableDeclaration.name));
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(root, visit);
  return new Map([...new Set(names)].map((name, index) => [name, `local:${index}`]));
}

function isPropertyName(node: ts.Identifier): boolean {
  const parent = node.parent;
  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    ((ts.isPropertyAssignment(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isPropertyDeclaration(parent)) &&
      parent.name === node) ||
    ts.isShorthandPropertyAssignment(parent)
  );
}

function literalToken(node: ts.Node, relaxed: boolean): string | undefined {
  if (ts.isStringLiteralLike(node)) {
    return relaxed ? 'literal:string' : `string:${node.text}`;
  }
  if (ts.isNumericLiteral(node)) {
    return relaxed ? 'literal:number' : `number:${node.text}`;
  }
  if (ts.isRegularExpressionLiteral(node)) {
    return relaxed ? 'literal:regexp' : `regexp:${node.text}`;
  }
  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    return relaxed ? 'literal:template' : `template:${node.text}`;
  }
  return undefined;
}

function canonicalTokens(root: ts.FunctionLikeDeclaration, relaxed: boolean): string[] {
  const locals = collectLocalNames(root);
  const tokens: string[] = [];

  const visit = (node: ts.Node): void => {
    if (node !== root && isFunctionLike(node)) {
      tokens.push('nested-function');
      return;
    }

    tokens.push(`kind:${node.kind}`);
    const literal = literalToken(node, relaxed);
    if (literal) {
      tokens.push(literal);
    } else if (ts.isIdentifier(node)) {
      const local = locals.get(node.text);
      const isRootName =
        (ts.isFunctionDeclaration(root) ||
          ts.isMethodDeclaration(root) ||
          ts.isFunctionExpression(root)) &&
        root.name === node;
      tokens.push(
        relaxed && isRootName
          ? 'function-name'
          : relaxed && local && !isPropertyName(node)
            ? local
            : `identifier:${node.text}`,
      );
    } else if (ts.isBinaryExpression(node)) {
      tokens.push(`operator:${node.operatorToken.kind}`);
    } else if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
      tokens.push(`operator:${node.operator}`);
    }

    ts.forEachChild(node, visit);
  };

  visit(root);
  return tokens;
}

function walkFunctionBody(
  root: ts.FunctionLikeDeclaration,
  callback: (node: ts.Node) => void,
): void {
  const visit = (node: ts.Node): void => {
    if (node !== root && isFunctionLike(node)) {
      return;
    }
    callback(node);
    ts.forEachChild(node, visit);
  };
  visit(root);
}

function statementCount(root: ts.FunctionLikeDeclaration): number {
  let count = 0;
  walkFunctionBody(root, (node) => {
    if (ts.isStatement(node) && !ts.isBlock(node)) {
      count += 1;
    }
  });
  return count;
}

function controlFlow(root: ts.FunctionLikeDeclaration): string[] {
  const result: string[] = [];
  walkFunctionBody(root, (node) => {
    if (
      ts.isIfStatement(node) ||
      ts.isSwitchStatement(node) ||
      ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isTryStatement(node) ||
      ts.isThrowStatement(node) ||
      ts.isAwaitExpression(node)
    ) {
      result.push(ts.SyntaxKind[node.kind]);
    }
  });
  return result;
}

function callName(expression: ts.LeftHandSideExpression): string {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text;
  }
  if (ts.isElementAccessExpression(expression)) {
    return '<element-access>';
  }
  return '<call-expression>';
}

function calls(root: ts.FunctionLikeDeclaration): string[] {
  const result = new Set<string>();
  walkFunctionBody(root, (node) => {
    if (ts.isCallExpression(node)) {
      result.add(callName(node.expression));
    }
  });
  return [...result].sort();
}

function className(node: ts.Node): string | undefined {
  let current = node.parent;
  while (!ts.isSourceFile(current)) {
    if (ts.isClassDeclaration(current)) {
      return current.name?.text ?? '<anonymous-class>';
    }
    current = current.parent;
  }
  return undefined;
}

function functionName(node: ts.FunctionLikeDeclaration): string {
  let ownName: string;
  if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && node.name) {
    ownName = node.name.getText();
  } else if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
    ownName = node.parent.name.text;
  } else if (ts.isPropertyDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
    ownName = node.parent.name.text;
  } else {
    ownName = '<anonymous>';
  }
  const owner = className(node);
  return owner ? `${owner}.${ownName}` : ownName;
}

function shingleCounts(tokens: readonly string[]): Map<string, number> {
  const result = new Map<string, number>();
  if (tokens.length < SHINGLE_SIZE) {
    result.set(tokens.join('|'), 1);
    return result;
  }
  for (let index = 0; index <= tokens.length - SHINGLE_SIZE; index += 1) {
    const shingle = tokens.slice(index, index + SHINGLE_SIZE).join('|');
    result.set(shingle, (result.get(shingle) ?? 0) + 1);
  }
  return result;
}

function diceSimilarity(left: readonly string[], right: readonly string[]): number {
  const leftCounts = shingleCounts(left);
  const rightCounts = shingleCounts(right);
  let intersection = 0;
  let leftTotal = 0;
  let rightTotal = 0;
  for (const count of leftCounts.values()) {
    leftTotal += count;
  }
  for (const [shingle, count] of rightCounts) {
    rightTotal += count;
    intersection += Math.min(count, leftCounts.get(shingle) ?? 0);
  }
  return (2 * intersection) / (leftTotal + rightTotal);
}

function sharedValues(left: readonly string[], right: readonly string[]): string[] {
  const rightValues = new Set(right);
  return [...new Set(left.filter((value) => rightValues.has(value)))].sort();
}

function candidateIdentity(left: FunctionRecord, right: FunctionRecord): string {
  return [
    `${left.occurrence.file}#${left.occurrence.symbol}`,
    `${right.occurrence.file}#${right.occurrence.symbol}`,
  ]
    .sort()
    .join('::');
}

function candidateFingerprint(left: FunctionRecord, right: FunctionRecord): string {
  return digest([left.relaxedFingerprint, right.relaxedFingerprint].sort().join(':'));
}

export function analyzeSources(
  sources: ReadonlyMap<string, string>,
  options: AnalyzeOptions = {},
): DuplicateCandidate[] {
  const minimumStatements = options.minimumStatements ?? DEFAULT_MINIMUM_STATEMENTS;
  const minimumTokens = options.minimumTokens ?? DEFAULT_MINIMUM_TOKENS;
  const threshold = options.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD;
  const changedFiles = options.changedFiles
    ? new Set([...options.changedFiles].map(normalizePath))
    : undefined;
  const records: FunctionRecord[] = [];

  for (const [rawFile, sourceText] of sources) {
    const file = normalizePath(rawFile);
    const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (isFunctionLike(node) && node.body && ts.isBlock(node.body) && !isNestedFunction(node)) {
        const strictTokens = canonicalTokens(node, false);
        const relaxedTokens = canonicalTokens(node, true);
        if (statementCount(node) >= minimumStatements && relaxedTokens.length >= minimumTokens) {
          const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
          records.push({
            occurrence: {
              file,
              symbol: functionName(node),
              startLine: start.line + 1,
              endLine: end.line + 1,
            },
            strictTokens,
            relaxedTokens,
            strictFingerprint: digest(strictTokens.join('|')),
            relaxedFingerprint: digest(relaxedTokens.join('|')),
            controlFlow: controlFlow(node),
            calls: calls(node),
          });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  const decisions = new Map(
    (options.decisions ?? []).map((decision) => [
      `${decision.candidateId}:${decision.fingerprint}`,
      decision,
    ]),
  );
  const candidates: DuplicateCandidate[] = [];

  for (let leftIndex = 0; leftIndex < records.length; leftIndex += 1) {
    const left = records[leftIndex];
    if (!left) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < records.length; rightIndex += 1) {
      const right = records[rightIndex];
      if (!right) continue;
      if (
        changedFiles &&
        !changedFiles.has(left.occurrence.file) &&
        !changedFiles.has(right.occurrence.file)
      ) {
        continue;
      }
      const lengthRatio =
        Math.min(left.relaxedTokens.length, right.relaxedTokens.length) /
        Math.max(left.relaxedTokens.length, right.relaxedTokens.length);
      if (lengthRatio < 0.8) continue;

      const score = diceSimilarity(left.relaxedTokens, right.relaxedTokens);
      if (score < threshold) continue;

      const identity = candidateIdentity(left, right);
      const id = `dup_${digest(identity).slice(0, 12)}`;
      const fingerprint = candidateFingerprint(left, right);
      const decision = decisions.get(`${id}:${fingerprint}`);
      const kind =
        left.strictFingerprint === right.strictFingerprint
          ? 'strict-ast'
          : left.relaxedFingerprint === right.relaxedFingerprint
            ? 'relaxed-ast'
            : 'near-ast';
      candidates.push({
        id,
        fingerprint,
        kind,
        score: Number(score.toFixed(3)),
        occurrences: [left.occurrence, right.occurrence],
        signals: {
          sameControlFlow: left.controlFlow.join('|') === right.controlFlow.join('|'),
          sharedCalls: sharedValues(left.calls, right.calls),
          literalsDiffer: left.strictFingerprint !== right.strictFingerprint,
        },
        review: decision
          ? {
              status: 'resolved',
              decision: decision.decision,
              reason: decision.reason,
            }
          : { status: 'unresolved' },
      });
    }
  }

  return candidates.sort(
    (left, right) => right.score - left.score || left.id.localeCompare(right.id),
  );
}

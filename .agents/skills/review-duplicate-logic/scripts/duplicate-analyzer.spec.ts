import { describe, expect, it } from 'vitest';

import { analyzeSources, type RecordedDecision } from './duplicate-analyzer.js';

const firstImplementation = `
export async function createTask(input: string) {
  const normalized = input.trim();
  if (normalized.length === 0) {
    throw new Error('title_required');
  }
  const existing = await findTask(normalized);
  if (existing) {
    throw new Error('task_exists');
  }
  const created = await insertTask(normalized);
  await publishTask(created);
  return created;
}
`;

const renamedImplementation = `
export async function addTask(title: string) {
  const cleanTitle = title.trim();
  if (cleanTitle.length === 0) {
    throw new Error('missing_title');
  }
  const duplicate = await findTask(cleanTitle);
  if (duplicate) {
    throw new Error('duplicate_task');
  }
  const result = await insertTask(cleanTitle);
  await publishTask(result);
  return result;
}
`;

describe('duplicate analyzer', () => {
  it('finds structurally equivalent logic after local names and literals change', () => {
    const candidates = analyzeSources(
      new Map([
        ['src/modules/tasks/create-task.ts', firstImplementation],
        ['src/modules/projects/add-task.ts', renamedImplementation],
      ]),
      { minimumStatements: 4, minimumTokens: 20 },
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      kind: 'relaxed-ast',
      score: 1,
      signals: {
        sameControlFlow: true,
        sharedCalls: ['findTask', 'insertTask', 'publishTask', 'trim'],
        literalsDiffer: true,
      },
      review: { status: 'unresolved' },
    });
  });

  it('does not compare unchanged functions during a changed-file scan', () => {
    const candidates = analyzeSources(
      new Map([
        ['src/modules/tasks/create-task.ts', firstImplementation],
        ['src/modules/projects/add-task.ts', renamedImplementation],
      ]),
      {
        changedFiles: new Set(['src/modules/health/health.ts']),
        minimumStatements: 4,
        minimumTokens: 20,
      },
    );

    expect(candidates).toEqual([]);
  });

  it('marks an unchanged recorded decision as resolved', () => {
    const sources = new Map([
      ['src/modules/tasks/create-task.ts', firstImplementation],
      ['src/modules/projects/add-task.ts', renamedImplementation],
    ]);
    const [candidate] = analyzeSources(sources, {
      minimumStatements: 4,
      minimumTokens: 20,
    });
    expect(candidate).toBeDefined();
    if (!candidate) return;

    const decision: RecordedDecision = {
      candidateId: candidate.id,
      fingerprint: candidate.fingerprint,
      decision: 'keep-separate',
      reason: 'Different aggregate ownership',
    };
    const [resolved] = analyzeSources(sources, {
      decisions: [decision],
      minimumStatements: 4,
      minimumTokens: 20,
    });

    expect(resolved?.review).toEqual({
      status: 'resolved',
      decision: 'keep-separate',
      reason: 'Different aggregate ownership',
    });
  });

  it('does not resolve a candidate after its implementation changes', () => {
    const sources = new Map([
      ['src/modules/tasks/create-task.ts', firstImplementation],
      ['src/modules/projects/add-task.ts', renamedImplementation],
    ]);
    const [candidate] = analyzeSources(sources, {
      minimumStatements: 4,
      minimumTokens: 20,
    });
    expect(candidate).toBeDefined();
    if (!candidate) return;

    const changedSources = new Map(sources);
    changedSources.set(
      'src/modules/projects/add-task.ts',
      renamedImplementation.replace('return result;', 'await auditTask(result);\n  return result;'),
    );
    const [changed] = analyzeSources(changedSources, {
      decisions: [
        {
          candidateId: candidate.id,
          fingerprint: candidate.fingerprint,
          decision: 'defer',
          reason: 'Wait for another use case',
        },
      ],
      minimumStatements: 4,
      minimumTokens: 20,
      similarityThreshold: 0.8,
    });

    expect(changed?.review.status).toBe('unresolved');
    expect(changed?.fingerprint).not.toBe(candidate.fingerprint);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { runCodeScript, runPythonScript } from '../../src/lib/utils/pythonRunner';

function createActions() {
  return {
    stackPush: vi.fn(),
    stackPop: vi.fn(),
    stackPeek: vi.fn(),
    stackClear: vi.fn(),
    stackLoadPreset: vi.fn(),
    heapInsert: vi.fn(),
    heapExtractRoot: vi.fn(),
    heapSetMode: vi.fn(),
    heapReset: vi.fn(),
    heapLoadPreset: vi.fn(),
    treeInsert: vi.fn(),
    treeDelete: vi.fn(),
    treeSearch: vi.fn(),
    treeTraverse: vi.fn(),
    treeReset: vi.fn(),
    treeLoadPreset: vi.fn(),
    queueEnqueue: vi.fn(),
    queueDequeue: vi.fn(),
    queueFront: vi.fn(),
    queueClear: vi.fn(),
    queueLoadPreset: vi.fn(),
    trieInsertWord: vi.fn(),
    trieDeleteWord: vi.fn(),
    trieSearchWord: vi.fn(),
    triePrefixSearch: vi.fn(),
    trieClear: vi.fn(),
    trieLoadPreset: vi.fn(),
    unionFindResize: vi.fn(),
    unionFindUnion: vi.fn(),
    unionFindFind: vi.fn(),
    unionFindConnected: vi.fn(),
    unionFindReset: vi.fn(),
    unionFindLoadPreset: vi.fn()
  };
}

describe('python runner', () => {
  it('runs sequential stack commands', () => {
    const actions = createActions();
    const result = runPythonScript(
      `
stack.push(4)
stack.push(9)
stack.pop()
`,
      { activeModule: 'stack', actions }
    );

    expect(result.ok).toBe(true);
    expect(result.executed).toBe(3);
    expect(actions.stackPush).toHaveBeenCalledTimes(2);
    expect(actions.stackPop).toHaveBeenCalledTimes(1);
  });

  it('supports for loops and variable expressions', () => {
    const actions = createActions();
    const result = runPythonScript(
      `
start = 10
for i in range(3):
  tree.insert(start + i)
`,
      { activeModule: 'tree', actions }
    );

    expect(result.ok).toBe(true);
    expect(actions.treeInsert).toHaveBeenNthCalledWith(1, 10);
    expect(actions.treeInsert).toHaveBeenNthCalledWith(2, 11);
    expect(actions.treeInsert).toHaveBeenNthCalledWith(3, 12);
  });

  it('returns an error when command does not match active module', () => {
    const actions = createActions();
    const result = runPythonScript('heap.insert(5)', { activeModule: 'stack', actions });

    expect(result.ok).toBe(false);
    expect(result.summary).toContain("Active module is 'stack'");
    expect(actions.heapInsert).not.toHaveBeenCalled();
  });

  it('runs JavaScript-style loops and statements', () => {
    const actions = createActions();
    const result = runCodeScript(
      `
let base = 7;
for (let i = 0; i < 3; i++) {
  stack.push(base + i);
}
stack.pop();
`,
      { activeModule: 'stack', actions },
      'javascript'
    );

    expect(result.ok).toBe(true);
    expect(result.executed).toBe(4);
    expect(actions.stackPush).toHaveBeenNthCalledWith(1, 7);
    expect(actions.stackPush).toHaveBeenNthCalledWith(2, 8);
    expect(actions.stackPush).toHaveBeenNthCalledWith(3, 9);
    expect(actions.stackPop).toHaveBeenCalledTimes(1);
  });

  it('runs C-style typed assignments and for loops', () => {
    const actions = createActions();
    const result = runCodeScript(
      `
int size = 6;
unionfind.resize(size);
for (int i = 1; i <= 3; i++) {
  unionfind.union(0, i);
}
`,
      { activeModule: 'unionfind', actions },
      'c'
    );

    expect(result.ok).toBe(true);
    expect(result.executed).toBe(4);
    expect(actions.unionFindResize).toHaveBeenCalledWith(6);
    expect(actions.unionFindUnion).toHaveBeenNthCalledWith(1, 0, 1);
    expect(actions.unionFindUnion).toHaveBeenNthCalledWith(2, 0, 2);
    expect(actions.unionFindUnion).toHaveBeenNthCalledWith(3, 0, 3);
  });

  it('ignores Java/C++ wrapper lines and executes module commands', () => {
    const actions = createActions();
    const result = runCodeScript(
      `
import java.util.*;
class Demo {
  public static void main(String[] args) {
    int base = 4;
    for (int i = 0; i < 2; i++) {
      queue.enqueue(base + i);
    }
    System.out.println("done");
  }
}
`,
      { activeModule: 'queue', actions },
      'java'
    );

    expect(result.ok).toBe(true);
    expect(result.executed).toBe(2);
    expect(actions.queueEnqueue).toHaveBeenNthCalledWith(1, 4);
    expect(actions.queueEnqueue).toHaveBeenNthCalledWith(2, 5);
  });
});

import type { TraversalType } from '../algorithms/bst';
import type { HeapMode } from '../algorithms/heap';
import type { ModuleId } from '../constants/modules';
import type { EditorLanguage } from '../constants/editor';
import { randomInt } from './random';

interface RunContext {
  activeModule: ModuleId;
  actions: {
    stackPush: (value: number) => void;
    stackPop: () => void;
    stackPeek: () => void;
    stackClear: () => void;
    stackLoadPreset: () => void;
    heapInsert: (value: number) => void;
    heapExtractRoot: () => void;
    heapSetMode: (mode: HeapMode) => void;
    heapReset: () => void;
    heapLoadPreset: () => void;
    treeInsert: (value: number) => void;
    treeDelete: (value: number) => void;
    treeSearch: (value: number) => void;
    treeTraverse: (type: TraversalType) => void;
    treeReset: () => void;
    treeLoadPreset: () => void;
    queueEnqueue: (value: number) => void;
    queueDequeue: () => void;
    queueFront: () => void;
    queueClear: () => void;
    queueLoadPreset: () => void;
    trieInsertWord: (word: string) => void;
    trieDeleteWord: (word: string) => void;
    trieSearchWord: (word: string) => void;
    triePrefixSearch: (prefix: string) => void;
    trieClear: () => void;
    trieLoadPreset: () => void;
    unionFindResize: (size: number) => void;
    unionFindUnion: (left: number, right: number) => void;
    unionFindFind: (index: number) => void;
    unionFindConnected: (left: number, right: number) => void;
    unionFindReset: () => void;
    unionFindLoadPreset: () => void;
  };
}

export interface PythonRunResult {
  ok: boolean;
  summary: string;
  executed: number;
}

interface CommandResult {
  executed: number;
}

type Env = Record<string, number | string>;

type SupportedLanguage = EditorLanguage;

function leadingSpaces(line: string): number {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}

function splitArguments(raw: string): string[] {
  const args: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let depth = 0;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];

    if (quote) {
      if (char === quote && raw[index - 1] !== '\\') {
        quote = null;
      }
      current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === '(') {
      depth += 1;
      current += char;
      continue;
    }

    if (char === ')') {
      depth -= 1;
      current += char;
      continue;
    }

    if (char === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim().length > 0) {
    args.push(current.trim());
  }

  return args;
}

function parseStringLiteral(value: string): string | null {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return null;
}

function evaluateNumberExpression(value: string, env: Env): number {
  const trimmed = value.trim();
  const parts: string[] = [];
  const operators: Array<'+' | '-'> = [];
  let token = '';
  let depth = 0;

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (char === '(') {
      depth += 1;
      token += char;
      continue;
    }

    if (char === ')') {
      depth -= 1;
      token += char;
      continue;
    }

    const isUnary = token.trim().length === 0;
    if (depth === 0 && (char === '+' || char === '-') && !isUnary) {
      parts.push(token.trim());
      operators.push(char);
      token = '';
      continue;
    }

    token += char;
  }

  if (token.trim().length > 0) {
    parts.push(token.trim());
  }

  const evaluateAtom = (atom: string): number => {
    if (/^-?\d+$/.test(atom)) {
      return Number(atom);
    }

    const randintMatch = atom.match(/^randint\((.+)\)$/);
    if (randintMatch) {
      const args = splitArguments(randintMatch[1]);
      if (args.length !== 2) {
        throw new Error('randint() expects exactly two arguments');
      }

      const min = evaluateNumberExpression(args[0], env);
      const max = evaluateNumberExpression(args[1], env);
      return randomInt(min, max);
    }

    if (/^[A-Za-z_]\w*$/.test(atom)) {
      const variable = env[atom];
      if (typeof variable !== 'number') {
        throw new Error(`Unknown numeric variable: ${atom}`);
      }
      return variable;
    }

    throw new Error(`Unsupported numeric expression: ${atom}`);
  };

  if (parts.length === 0) {
    throw new Error(`Unsupported numeric expression: ${trimmed}`);
  }

  let result = evaluateAtom(parts[0]);
  for (let index = 1; index < parts.length; index += 1) {
    const atomValue = evaluateAtom(parts[index]);
    result = operators[index - 1] === '+' ? result + atomValue : result - atomValue;
  }

  return result;
}

function evaluateStringExpression(value: string, env: Env): string {
  const literal = parseStringLiteral(value);
  if (literal !== null) {
    return literal;
  }

  const variable = env[value.trim()];
  if (typeof variable === 'string') {
    return variable;
  }

  throw new Error(`Unsupported string expression: ${value.trim()}`);
}

function runModuleCommand(context: RunContext, object: string, method: string, args: string[], env: Env): number {
  const expectArgCount = (expected: number) => {
    if (args.length !== expected) {
      throw new Error(`${object}.${method} expects ${expected} argument${expected === 1 ? '' : 's'}`);
    }
  };

  if (object !== context.activeModule) {
    throw new Error(`Active module is '${context.activeModule}'. Use ${context.activeModule}.* commands.`);
  }

  const { actions } = context;

  if (object === 'stack') {
    if (method === 'push') {
      expectArgCount(1);
      actions.stackPush(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'pop') {
      expectArgCount(0);
      actions.stackPop();
      return 1;
    }
    if (method === 'peek') {
      expectArgCount(0);
      actions.stackPeek();
      return 1;
    }
    if (method === 'clear') {
      expectArgCount(0);
      actions.stackClear();
      return 1;
    }
    if (method === 'preset') {
      expectArgCount(0);
      actions.stackLoadPreset();
      return 1;
    }
  }

  if (object === 'heap') {
    if (method === 'insert') {
      expectArgCount(1);
      actions.heapInsert(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'extract' || method === 'extract_root') {
      expectArgCount(0);
      actions.heapExtractRoot();
      return 1;
    }
    if (method === 'mode') {
      expectArgCount(1);
      const mode = evaluateStringExpression(args[0], env).toLowerCase();
      if (mode !== 'min' && mode !== 'max') {
        throw new Error(`heap.mode expects 'min' or 'max', got '${mode}'`);
      }
      actions.heapSetMode(mode as HeapMode);
      return 1;
    }
    if (method === 'reset') {
      expectArgCount(0);
      actions.heapReset();
      return 1;
    }
    if (method === 'preset') {
      expectArgCount(0);
      actions.heapLoadPreset();
      return 1;
    }
  }

  if (object === 'tree') {
    if (method === 'insert') {
      expectArgCount(1);
      actions.treeInsert(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'delete') {
      expectArgCount(1);
      actions.treeDelete(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'search') {
      expectArgCount(1);
      actions.treeSearch(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'traverse') {
      expectArgCount(1);
      const traversal = evaluateStringExpression(args[0], env).toLowerCase();
      if (!['inorder', 'preorder', 'postorder', 'level'].includes(traversal)) {
        throw new Error(`tree.traverse expects inorder/preorder/postorder/level, got '${traversal}'`);
      }
      actions.treeTraverse(traversal as TraversalType);
      return 1;
    }
    if (method === 'reset') {
      expectArgCount(0);
      actions.treeReset();
      return 1;
    }
    if (method === 'preset') {
      expectArgCount(0);
      actions.treeLoadPreset();
      return 1;
    }
  }

  if (object === 'queue') {
    if (method === 'enqueue') {
      expectArgCount(1);
      actions.queueEnqueue(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'dequeue') {
      expectArgCount(0);
      actions.queueDequeue();
      return 1;
    }
    if (method === 'front' || method === 'peek') {
      expectArgCount(0);
      actions.queueFront();
      return 1;
    }
    if (method === 'clear') {
      expectArgCount(0);
      actions.queueClear();
      return 1;
    }
    if (method === 'preset') {
      expectArgCount(0);
      actions.queueLoadPreset();
      return 1;
    }
  }

  if (object === 'trie') {
    if (method === 'insert') {
      expectArgCount(1);
      actions.trieInsertWord(evaluateStringExpression(args[0], env));
      return 1;
    }
    if (method === 'delete') {
      expectArgCount(1);
      actions.trieDeleteWord(evaluateStringExpression(args[0], env));
      return 1;
    }
    if (method === 'search') {
      expectArgCount(1);
      actions.trieSearchWord(evaluateStringExpression(args[0], env));
      return 1;
    }
    if (method === 'prefix' || method === 'starts_with') {
      expectArgCount(1);
      actions.triePrefixSearch(evaluateStringExpression(args[0], env));
      return 1;
    }
    if (method === 'clear') {
      expectArgCount(0);
      actions.trieClear();
      return 1;
    }
    if (method === 'preset') {
      expectArgCount(0);
      actions.trieLoadPreset();
      return 1;
    }
  }

  if (object === 'unionfind') {
    if (method === 'resize') {
      expectArgCount(1);
      actions.unionFindResize(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'union') {
      expectArgCount(2);
      actions.unionFindUnion(
        evaluateNumberExpression(args[0], env),
        evaluateNumberExpression(args[1], env)
      );
      return 1;
    }
    if (method === 'find') {
      expectArgCount(1);
      actions.unionFindFind(evaluateNumberExpression(args[0], env));
      return 1;
    }
    if (method === 'connected') {
      expectArgCount(2);
      actions.unionFindConnected(
        evaluateNumberExpression(args[0], env),
        evaluateNumberExpression(args[1], env)
      );
      return 1;
    }
    if (method === 'reset') {
      expectArgCount(0);
      actions.unionFindReset();
      return 1;
    }
    if (method === 'preset') {
      expectArgCount(0);
      actions.unionFindLoadPreset();
      return 1;
    }
  }

  throw new Error(`Unsupported command: ${object}.${method}()`);
}

function parseRangeParts(expression: string, env: Env): [number, number, number] {
  const args = splitArguments(expression);
  if (args.length === 1) {
    return [0, evaluateNumberExpression(args[0], env), 1];
  }
  if (args.length === 2) {
    return [evaluateNumberExpression(args[0], env), evaluateNumberExpression(args[1], env), 1];
  }
  if (args.length === 3) {
    return [
      evaluateNumberExpression(args[0], env),
      evaluateNumberExpression(args[1], env),
      evaluateNumberExpression(args[2], env)
    ];
  }

  throw new Error('range() supports 1 to 3 arguments');
}

function executeCommandLine(context: RunContext, line: string, env: Env): CommandResult {
  const assignment = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
  if (assignment) {
    const variable = assignment[1];
    const expression = assignment[2];
    const asString = parseStringLiteral(expression);
    env[variable] = asString ?? evaluateNumberExpression(expression, env);
    return { executed: 0 };
  }

  const command = line.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\((.*)\)$/);
  if (!command) {
    throw new Error(`Could not parse command: ${line}`);
  }

  const object = command[1];
  const method = command[2];
  const argsRaw = command[3].trim();
  const args = argsRaw.length === 0 ? [] : splitArguments(argsRaw);
  const executed = runModuleCommand(context, object, method, args, env);
  return { executed };
}

function executeBlock(
  context: RunContext,
  lines: string[],
  startIndex: number,
  minIndent: number,
  env: Env
): { nextIndex: number; executed: number } {
  let index = startIndex;
  let executed = 0;

  while (index < lines.length) {
    const source = lines[index];
    const trimmed = source.trim();

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      index += 1;
      continue;
    }

    const indent = leadingSpaces(source);
    if (indent < minIndent) {
      break;
    }

    if (indent > minIndent) {
      throw new Error(`Unexpected indentation on line ${index + 1}`);
    }

    const forLoop = trimmed.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((.+)\):$/);
    if (forLoop) {
      const variable = forLoop[1];
      const [start, stop, step] = parseRangeParts(forLoop[2], env);
      if (step === 0) {
        throw new Error('range() step cannot be 0');
      }

      let bodyIndex = index + 1;
      while (bodyIndex < lines.length && lines[bodyIndex].trim().length === 0) {
        bodyIndex += 1;
      }

      if (bodyIndex >= lines.length || leadingSpaces(lines[bodyIndex]) <= indent) {
        throw new Error(`for loop on line ${index + 1} needs an indented body`);
      }

      const bodyIndent = leadingSpaces(lines[bodyIndex]);
      let blockEnd = bodyIndex;
      while (blockEnd < lines.length) {
        const probe = lines[blockEnd];
        if (probe.trim().length === 0) {
          blockEnd += 1;
          continue;
        }

        if (leadingSpaces(probe) < bodyIndent) {
          break;
        }

        blockEnd += 1;
      }
      const loopValues: number[] = [];

      if (step > 0) {
        for (let value = start; value < stop; value += step) {
          loopValues.push(value);
        }
      } else {
        for (let value = start; value > stop; value += step) {
          loopValues.push(value);
        }
      }

      for (const value of loopValues) {
        env[variable] = value;
        const loopRun = executeBlock(context, lines, bodyIndex, bodyIndent, env);
        executed += loopRun.executed;
      }

      index = blockEnd;
      continue;
    }

    const lineResult = executeCommandLine(context, trimmed, env);
    executed += lineResult.executed;
    index += 1;
  }

  return {
    nextIndex: index,
    executed
  };
}

function parseCStyleForLoop(line: string): string | null {
  const forMatch = line.match(/^for\s*\(\s*(.+)\s*;\s*(.+)\s*;\s*(.+)\s*\)$/);
  if (!forMatch) {
    return null;
  }

  const initializer = forMatch[1].trim();
  const condition = forMatch[2].trim();
  const increment = forMatch[3].trim();

  const initMatch = initializer.match(
    /^(?:(?:const|let|var)\s+)?(?:(?:unsigned|signed|short|long)\s+)*(?:(?:int|long|double|float|size_t|char|String|string|boolean|bool|auto)\s+)?([A-Za-z_]\w*)\s*=\s*(.+)$/
  );
  if (!initMatch) {
    return null;
  }

  const variable = initMatch[1];
  const startExpression = initMatch[2].trim();

  const conditionMatch = condition.match(/^([A-Za-z_]\w*)\s*(<=|<|>=|>)\s*(.+)$/);
  if (!conditionMatch || conditionMatch[1] !== variable) {
    return null;
  }

  const comparator = conditionMatch[2];
  const stopExpression = conditionMatch[3].trim();
  let stepExpression = '';

  if (increment === `${variable}++` || increment === `++${variable}`) {
    stepExpression = '1';
  } else if (increment === `${variable}--` || increment === `--${variable}`) {
    stepExpression = '-1';
  } else {
    const deltaMatch = increment.match(
      new RegExp(`^${variable}\\s*(\\+=|-=)\\s*(.+)$`)
    );
    if (deltaMatch) {
      stepExpression =
        deltaMatch[1] === '+=' ? deltaMatch[2].trim() : `0 - ${deltaMatch[2].trim()}`;
    } else {
      const assignmentStepMatch = increment.match(
        new RegExp(`^${variable}\\s*=\\s*${variable}\\s*(\\+|-)\\s*(.+)$`)
      );
      if (!assignmentStepMatch) {
        return null;
      }
      stepExpression =
        assignmentStepMatch[1] === '+'
          ? assignmentStepMatch[2].trim()
          : `0 - ${assignmentStepMatch[2].trim()}`;
    }
  }

  let adjustedStopExpression = stopExpression;
  if (comparator === '<=') {
    adjustedStopExpression = `${stopExpression} + 1`;
  } else if (comparator === '>=') {
    adjustedStopExpression = `${stopExpression} - 1`;
  }

  return `for ${variable} in range(${startExpression}, ${adjustedStopExpression}, ${stepExpression}):`;
}

function normalizeTypedAssignment(line: string): string {
  const typedMatch = line.match(
    /^(?:(?:const|let|var)\s+)?(?:(?:unsigned|signed|short|long)\s+)*(?:(?:int|long|double|float|size_t|char|String|string|boolean|bool|auto)\s+)?([A-Za-z_]\w*)\s*=\s*(.+)$/
  );

  if (!typedMatch) {
    return line;
  }

  return `${typedMatch[1]} = ${typedMatch[2].trim()}`;
}

function shouldIgnoreNonRuntimeLine(line: string): boolean {
  const trimmed = line.trim();

  if (
    /^(#include|import|package|using\s+namespace)\b/.test(trimmed) ||
    /^(class|struct|namespace)\b/.test(trimmed) ||
    /^(public|private|protected)\s*:/.test(trimmed) ||
    /^(console\.log|System\.out\.println|printf|std::cout)\b/.test(trimmed) ||
    /^return\b/.test(trimmed)
  ) {
    return true;
  }

  return /^(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(?:void|int|long|double|float|char|bool|boolean|string|String|auto)\s+[A-Za-z_]\w*\s*\([^)]*\)$/.test(
    trimmed
  );
}

function normalizeScriptLines(script: string, language: SupportedLanguage): string[] {
  if (language === 'python') {
    return script.replace(/\t/g, '  ').split(/\r?\n/);
  }

  const lines = script.replace(/\t/g, '  ').split(/\r?\n/);
  const normalized: string[] = [];
  let indentLevel = 0;

  for (const source of lines) {
    let line = source.trim();
    if (line.length === 0) {
      normalized.push('');
      continue;
    }

    const inlineComment = line.indexOf('//');
    if (inlineComment !== -1) {
      if (inlineComment === 0) {
        normalized.push(`${'  '.repeat(indentLevel)}#${line.slice(2).trim()}`);
        continue;
      }
      line = line.slice(0, inlineComment).trim();
      if (line.length === 0) {
        continue;
      }
    }

    while (line.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
      line = line.slice(1).trim();
    }

    if (line.length === 0) {
      continue;
    }

    if (line === '{') {
      indentLevel += 1;
      continue;
    }

    let opensBlock = false;
    if (line.endsWith('{')) {
      opensBlock = true;
      line = line.slice(0, -1).trim();
    }

    line = line.replace(/;+\s*$/, '').trim();
    if (line.length === 0) {
      if (opensBlock) {
        indentLevel += 1;
      }
      continue;
    }

    if (shouldIgnoreNonRuntimeLine(line)) {
      continue;
    }

    const forLoop = parseCStyleForLoop(line);
    const normalizedLine = forLoop ?? normalizeTypedAssignment(line);
    normalized.push(`${'  '.repeat(indentLevel)}${normalizedLine}`);

    if (opensBlock) {
      indentLevel += 1;
    }
  }

  return normalized;
}

export function runCodeScript(
  script: string,
  context: RunContext,
  language: SupportedLanguage
): PythonRunResult {
  const lines = normalizeScriptLines(script, language);

  try {
    const env: Env = {};
    const result = executeBlock(context, lines, 0, 0, env);
    if (result.executed === 0) {
      return {
        ok: true,
        summary: 'Script ran successfully. No data-structure actions were executed.',
        executed: 0
      };
    }

    return {
      ok: true,
      summary: `Script ran successfully. Executed ${result.executed} action${result.executed === 1 ? '' : 's'}.`,
      executed: result.executed
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown script error';
    return {
      ok: false,
      summary: message,
      executed: 0
    };
  }
}

export function runPythonScript(script: string, context: RunContext): PythonRunResult {
  return runCodeScript(script, context, 'python');
}

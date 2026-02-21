import { describe, expect, it } from 'vitest';
import {
  connectedNodes,
  createUnionFindState,
  findNode,
  unionNodes
} from '../../src/lib/algorithms/unionFind';

describe('union-find algorithms', () => {
  it('unions two nodes into one set', () => {
    let state = createUnionFindState(6);
    state = unionNodes(state, 0, 1).next;
    state = unionNodes(state, 1, 2).next;

    const found = findNode(state, 2);
    expect(found.next.lastRoot).toBe(0);
    expect(found.isError).toBeUndefined();
  });

  it('checks connected status', () => {
    let state = createUnionFindState(6);
    state = unionNodes(state, 3, 4).next;

    const connected = connectedNodes(state, 3, 4);
    const notConnected = connectedNodes(state, 1, 5);

    expect(connected.next.connectedResult).toBe(true);
    expect(notConnected.next.connectedResult).toBe(false);
  });
});

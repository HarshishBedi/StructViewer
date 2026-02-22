import { useMemo } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

function findRoot(parent: number[], index: number): number {
  let current = index;
  while (parent[current] !== current) {
    current = parent[current];
  }
  return current;
}

export function UnionFindVisualizer() {
  const state = useAlgoStore(
    (store) => store.unionFindSession.history[store.unionFindSession.cursor].state
  );
  const groups = useMemo(() => {
    const next = new Map<number, number[]>();
    for (let index = 0; index < state.size; index += 1) {
      const root = findRoot(state.parent, index);
      const existing = next.get(root) ?? [];
      existing.push(index);
      next.set(root, existing);
    }

    return [...next.entries()]
      .sort((left, right) => left[0] - right[0])
      .map(([root, members]) => ({ root, members: members.sort((a, b) => a - b) }));
  }, [state.parent, state.size]);

  return (
    <div className="viz-union" aria-label="Union-Find visualization">
      <div className="union-groups" role="list" aria-label="Disjoint set components">
        {groups.map((group) => (
          <section key={`uf-group-${group.root}`} className="union-group" role="listitem">
            <header className="union-group-head">
              <strong>Root {group.root}</strong>
              <span>
                {group.members.length} node{group.members.length === 1 ? '' : 's'}
              </span>
            </header>
            <div className="union-group-members">
              {group.members.map((member) => (
                <div
                  key={`uf-member-${member}`}
                  className={cn(
                    'union-node',
                    member === group.root && 'union-node-root',
                    state.highlighted.includes(member) && 'union-node-highlighted'
                  )}
                >
                  {member}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="union-parent-map" aria-label="Parent pointer map">
        <header className="union-parent-head">Parent map</header>
        <div className="union-parent-strip">
          {state.parent.map((parent, index) => (
            <div
              key={`uf-parent-${index}`}
              className={cn(
                'union-parent-cell',
                state.highlighted.includes(index) && 'union-parent-active'
              )}
            >
              <span>{index}</span>
              <strong>{parent}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

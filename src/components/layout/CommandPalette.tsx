import { useEffect, useMemo, useState } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

export function CommandPalette() {
  const open = useAlgoStore((state) => state.commandPaletteOpen);
  const setOpen = useAlgoStore((state) => state.setCommandPaletteOpen);
  const setModule = useAlgoStore((state) => state.setActiveModule);
  const reset = useAlgoStore((state) => state.resetActiveStructure);
  const prevStep = useAlgoStore((state) => state.prevStep);
  const nextStep = useAlgoStore((state) => state.nextStep);
  const toggleAutoplay = useAlgoStore((state) => state.toggleAutoplay);
  const setThemeMode = useAlgoStore((state) => state.setThemeMode);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open && query.length > 0) {
      setQuery('');
    }
  }, [open, query.length]);

  const commands = useMemo<Command[]>(
    () => [
      { id: 'switch-stack', label: 'Switch to Stacks', hint: '1', run: () => setModule('stack') },
      { id: 'switch-heap', label: 'Switch to Heaps', hint: '2', run: () => setModule('heap') },
      { id: 'switch-tree', label: 'Switch to Trees', hint: '3', run: () => setModule('tree') },
      { id: 'theme-system', label: 'Use system theme', hint: 'Theme', run: () => setThemeMode('system') },
      { id: 'theme-light', label: 'Use light theme', hint: 'Theme', run: () => setThemeMode('light') },
      { id: 'theme-dark', label: 'Use dark theme', hint: 'Theme', run: () => setThemeMode('dark') },
      { id: 'prev-step', label: 'Previous timeline step', hint: 'P', run: prevStep },
      { id: 'next-step', label: 'Next timeline step', hint: 'N', run: nextStep },
      { id: 'toggle-autoplay', label: 'Toggle autoplay', hint: 'A', run: toggleAutoplay },
      { id: 'reset-structure', label: 'Reset current structure', hint: 'R', run: reset }
    ],
    [nextStep, prevStep, reset, setModule, setThemeMode, toggleAutoplay]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands;
    }

    return commands.filter((command) => command.label.toLowerCase().includes(normalized));
  }, [commands, query]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={() => {
        setOpen(false);
        setQuery('');
      }}
    >
      <section
        className="palette-card"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands..."
          className="palette-input"
        />

        <ul className="palette-list">
          {filtered.map((command) => (
            <li key={command.id}>
              <button
                type="button"
                className={cn('palette-item')}
                onClick={() => {
                  command.run();
                  setOpen(false);
                  setQuery('');
                }}
              >
                <span>{command.label}</span>
                <kbd>{command.hint}</kbd>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="palette-empty">No commands found.</li>}
        </ul>
      </section>
    </div>
  );
}

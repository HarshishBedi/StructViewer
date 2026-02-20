import { MODULES } from '../../lib/constants/modules';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { type ThemeMode } from '../../lib/theme/theme';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/Button';

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string }> = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' }
];

export function TopBar() {
  const activeModule = useAlgoStore((state) => state.activeModule);
  const setActiveModule = useAlgoStore((state) => state.setActiveModule);
  const resetActiveStructure = useAlgoStore((state) => state.resetActiveStructure);
  const setHelpOpen = useAlgoStore((state) => state.setHelpOpen);
  const setCommandPaletteOpen = useAlgoStore((state) => state.setCommandPaletteOpen);
  const themeMode = useAlgoStore((state) => state.themeMode);
  const setThemeMode = useAlgoStore((state) => state.setThemeMode);

  return (
    <header className="topbar">
      <div className="brand">
        <p className="brand-kicker">Interactive Algorithm Lab</p>
        <h1>AlgoVis</h1>
      </div>

      <nav className="module-switcher" aria-label="Select data structure module">
        {MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            className={cn('module-chip', activeModule === module.id && 'module-chip-active')}
            onClick={() => setActiveModule(module.id)}
          >
            <span>{module.title}</span>
            <kbd>{module.id === 'stack' ? '1' : module.id === 'heap' ? '2' : '3'}</kbd>
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <div className="theme-toggle" role="group" aria-label="Theme preference">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={cn('theme-toggle-btn', themeMode === option.id && 'theme-toggle-btn-active')}
              onClick={() => setThemeMode(option.id)}
              aria-pressed={themeMode === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCommandPaletteOpen(true)}>
          Command
          <kbd>⌘K</kbd>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
          Shortcuts
          <kbd>?</kbd>
        </Button>
        <Button variant="secondary" size="sm" onClick={resetActiveStructure}>
          Reset
          <kbd>R</kbd>
        </Button>
      </div>
    </header>
  );
}

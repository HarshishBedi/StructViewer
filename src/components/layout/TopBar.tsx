import { MODULES, MODULE_SHORTCUTS } from '../../lib/constants/modules';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { type ThemeMode } from '../../lib/theme/theme';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/Button';
import { IconCommand, IconKeyboard, IconMoon, IconSun } from '../ui/icons';

const THEME_LABELS: Record<'light' | 'dark', string> = {
  light: 'Light',
  dark: 'Dark'
};

function resolveDisplayTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }

  if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark') {
    return 'dark';
  }

  return 'light';
}

function getNextThemeMode(mode: ThemeMode): 'light' | 'dark' {
  return resolveDisplayTheme(mode) === 'dark' ? 'light' : 'dark';
}

function ThemeModeIcon({ mode }: { mode: 'light' | 'dark' }) {
  if (mode === 'light') {
    return <IconSun className="theme-toggle-icon" />;
  }

  return <IconMoon className="theme-toggle-icon" />;
}

export function TopBar() {
  const activeModule = useAlgoStore((state) => state.activeModule);
  const setActiveModule = useAlgoStore((state) => state.setActiveModule);
  const setHelpOpen = useAlgoStore((state) => state.setHelpOpen);
  const setCommandPaletteOpen = useAlgoStore((state) => state.setCommandPaletteOpen);
  const themeMode = useAlgoStore((state) => state.themeMode);
  const setThemeMode = useAlgoStore((state) => state.setThemeMode);
  const displayTheme = resolveDisplayTheme(themeMode);
  const nextThemeMode = getNextThemeMode(themeMode);

  return (
    <header className="topbar" role="banner">
      <div className="brand-shell" title="structviewer">
        <div className="brand-mark-wrap" aria-hidden="true">
          <img src="/icons/structviewer-mark.svg" alt="" className="brand-mark" />
        </div>
        <div className="brand">
          <h1>structviewer</h1>
          <p className="brand-kicker">Structure Visualization Lab</p>
        </div>
      </div>

      <div className="navbar-primary" role="navigation" aria-label="Data structure modules">
        <nav className="module-switcher" aria-label="Select data structure module">
          {MODULES.map((module) => (
            <button
              key={module.id}
              type="button"
              className={cn('module-chip', activeModule === module.id && 'module-chip-active')}
              onClick={() => setActiveModule(module.id)}
              aria-current={activeModule === module.id ? 'page' : undefined}
              aria-keyshortcuts={MODULE_SHORTCUTS[module.id]}
              title={`${module.title} (${MODULE_SHORTCUTS[module.id]})`}
            >
              <span className="module-chip-label">{module.title}</span>
              <kbd>{MODULE_SHORTCUTS[module.id]}</kbd>
            </button>
          ))}
        </nav>
      </div>

      <div className="topbar-actions" role="toolbar" aria-label="Application controls">
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          className="navbar-action"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open command palette"
          aria-keyshortcuts="Control+K Meta+K"
          title="Command Palette (Ctrl/Cmd + K)"
        >
          <IconCommand className="theme-toggle-icon" />
          <span className="sr-only">Open command palette</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          className="navbar-action"
          onClick={() => setHelpOpen(true)}
          aria-label="Show keyboard shortcuts"
          aria-keyshortcuts="?"
          title="Keyboard Shortcuts (?)"
        >
          <IconKeyboard className="theme-toggle-icon" />
          <span className="sr-only">Show keyboard shortcuts</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          className="navbar-action theme-toggle-btn"
          onClick={() => setThemeMode(nextThemeMode)}
          aria-label={`Theme ${THEME_LABELS[displayTheme]}. Switch to ${THEME_LABELS[nextThemeMode]}`}
          title={`Theme: ${THEME_LABELS[displayTheme]}`}
        >
          <ThemeModeIcon mode={displayTheme} />
          <span className="sr-only">Toggle theme mode</span>
        </Button>
      </div>
    </header>
  );
}

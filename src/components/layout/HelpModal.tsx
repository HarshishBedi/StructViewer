import { SHORTCUTS } from '../../lib/constants/shortcuts';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { Button } from '../ui/Button';

export function HelpModal() {
  const helpOpen = useAlgoStore((state) => state.helpOpen);
  const setHelpOpen = useAlgoStore((state) => state.setHelpOpen);

  if (!helpOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={() => setHelpOpen(false)}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <Button size="sm" variant="ghost" onClick={() => setHelpOpen(false)}>
            Close
          </Button>
        </header>
        <ul className="shortcut-list">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.key}>
              <kbd>{shortcut.key}</kbd>
              <span>{shortcut.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

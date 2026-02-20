import { useEffect, useMemo, useState } from 'react';
import { HeapControls } from '../components/controls/HeapControls';
import { StackControls } from '../components/controls/StackControls';
import { TreeControls } from '../components/controls/TreeControls';
import { CommandPalette } from '../components/layout/CommandPalette';
import { HelpModal } from '../components/layout/HelpModal';
import { OperationLog } from '../components/layout/OperationLog';
import { TimelineBar } from '../components/layout/TimelineBar';
import { TopBar } from '../components/layout/TopBar';
import { Panel } from '../components/ui/Panel';
import { HeapModule } from '../features/heaps/HeapModule';
import { StackModule } from '../features/stacks/StackModule';
import { TreeModule } from '../features/trees/TreeModule';
import { MODULES } from '../lib/constants/modules';
import { useActiveCurrentStep, useActiveSessionMeta, useAlgoStore } from '../lib/state/useAlgoStore';
import { applyResolvedTheme, resolveTheme } from '../lib/theme/theme';
import { cn } from '../lib/utils/cn';

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null
  );
}

export function App() {
  const activeModule = useAlgoStore((state) => state.activeModule);
  const setActiveModule = useAlgoStore((state) => state.setActiveModule);
  const prevStep = useAlgoStore((state) => state.prevStep);
  const nextStep = useAlgoStore((state) => state.nextStep);
  const resetActiveStructure = useAlgoStore((state) => state.resetActiveStructure);
  const toggleAutoplay = useAlgoStore((state) => state.toggleAutoplay);
  const autoplay = useAlgoStore((state) => state.autoplay);
  const setAutoplay = useAlgoStore((state) => state.setAutoplay);
  const setHelpOpen = useAlgoStore((state) => state.setHelpOpen);
  const helpOpen = useAlgoStore((state) => state.helpOpen);
  const setCommandPaletteOpen = useAlgoStore((state) => state.setCommandPaletteOpen);
  const commandPaletteOpen = useAlgoStore((state) => state.commandPaletteOpen);
  const themeMode = useAlgoStore((state) => state.themeMode);

  const { currentStep, totalSteps } = useActiveSessionMeta();
  const currentTimelineStep = useActiveCurrentStep();
  const [stepUpdated, setStepUpdated] = useState(false);

  const activeModuleMeta = useMemo(
    () => MODULES.find((module) => module.id === activeModule) ?? MODULES[0],
    [activeModule]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      applyResolvedTheme(resolveTheme(themeMode, false), themeMode);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      applyResolvedTheme(resolveTheme(themeMode, mediaQuery.matches), themeMode);
    };

    syncTheme();

    if (themeMode !== 'system') {
      return;
    }

    const onPreferenceChange = () => {
      syncTheme();
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onPreferenceChange);
      return () => {
        mediaQuery.removeEventListener('change', onPreferenceChange);
      };
    }

    mediaQuery.addListener(onPreferenceChange);
    return () => {
      mediaQuery.removeListener(onPreferenceChange);
    };
  }, [themeMode]);

  useEffect(() => {
    if (!autoplay) {
      return;
    }

    if (currentStep >= totalSteps - 1) {
      setAutoplay(false);
      return;
    }

    const handle = window.setTimeout(() => {
      nextStep();
    }, 760);

    return () => {
      window.clearTimeout(handle);
    };
  }, [autoplay, currentStep, nextStep, setAutoplay, totalSteps]);

  useEffect(() => {
    setStepUpdated(true);
    const timer = window.setTimeout(() => {
      setStepUpdated(false);
    }, 260);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentTimelineStep.timestamp]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (event.key === 'Escape') {
        setHelpOpen(false);
        setCommandPaletteOpen(false);
        return;
      }

      if (isEditableElement(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === '1') {
        setActiveModule('stack');
      } else if (key === '2') {
        setActiveModule('heap');
      } else if (key === '3') {
        setActiveModule('tree');
      } else if (key === 'a') {
        toggleAutoplay();
      } else if (key === 'n') {
        nextStep();
      } else if (key === 'p') {
        prevStep();
      } else if (key === 'r') {
        resetActiveStructure();
      } else if (event.key === '?') {
        setHelpOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [nextStep, prevStep, resetActiveStructure, setActiveModule, setCommandPaletteOpen, setHelpOpen, toggleAutoplay]);

  return (
    <div className="app-shell">
      <TopBar />

      <main className="main-grid">
        <Panel
          className="left-panel"
          title={`${activeModuleMeta.title} Controls`}
          subtitle={activeModuleMeta.description}
        >
          {activeModule === 'stack' && <StackControls />}
          {activeModule === 'heap' && <HeapControls />}
          {activeModule === 'tree' && <TreeControls />}
        </Panel>

        <Panel
          className="center-panel"
          title={activeModuleMeta.title}
          subtitle={activeModuleMeta.complexityHint}
        >
          {activeModule === 'stack' && <StackModule />}
          {activeModule === 'heap' && <HeapModule />}
          {activeModule === 'tree' && <TreeModule />}
        </Panel>

        <Panel className="right-panel" title="Operation Details" subtitle="Live execution feedback">
          <article
            className={cn(
              'step-card',
              currentTimelineStep.isError && 'step-card-error',
              stepUpdated && 'step-card-updated'
            )}
            aria-live="polite"
          >
            <p
              className={cn(
                'step-status-badge',
                currentTimelineStep.isError ? 'step-status-error' : 'step-status-success'
              )}
            >
              {currentTimelineStep.isError ? 'Needs Attention' : 'Action Applied'}
            </p>
            <h3>{currentTimelineStep.title}</h3>
            <p>{currentTimelineStep.description}</p>
            <div className="step-meta">
              <span>Complexity: {currentTimelineStep.complexity}</span>
              <span>Step: {currentStep + 1}</span>
            </div>
          </article>

          <div className="log-header">
            <h4>Timeline Log</h4>
            <p>{totalSteps} entries</p>
          </div>
          <OperationLog />
        </Panel>
      </main>

      <TimelineBar />

      {(helpOpen || commandPaletteOpen) && <div className="backdrop-blur" aria-hidden="true" />}
      <HelpModal />
      <CommandPalette />
    </div>
  );
}

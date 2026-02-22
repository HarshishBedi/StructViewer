import { useEffect, useMemo, useRef, useState } from 'react';
import { HeapControls } from '../components/controls/HeapControls';
import { PythonConsole } from '../components/controls/PythonConsole';
import { QueueControls } from '../components/controls/QueueControls';
import { StackControls } from '../components/controls/StackControls';
import { TreeControls } from '../components/controls/TreeControls';
import { TrieControls } from '../components/controls/TrieControls';
import { UnionFindControls } from '../components/controls/UnionFindControls';
import { CommandPalette } from '../components/layout/CommandPalette';
import { FeedbackFooter } from '../components/layout/FeedbackFooter';
import { HelpModal } from '../components/layout/HelpModal';
import { OperationLog } from '../components/layout/OperationLog';
import { TimelineBar } from '../components/layout/TimelineBar';
import { TopBar } from '../components/layout/TopBar';
import { MessageBubble } from '../components/ui/MessageBubble';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { HeapModule } from '../features/heaps/HeapModule';
import { QueueModule } from '../features/queues/QueueModule';
import { StackModule } from '../features/stacks/StackModule';
import { TreeModule } from '../features/trees/TreeModule';
import { TrieModule } from '../features/tries/TrieModule';
import { UnionFindModule } from '../features/unionfind/UnionFindModule';
import { MODULES, type ModuleId } from '../lib/constants/modules';
import { useActiveCurrentStep, useActiveSessionMeta, useAlgoStore } from '../lib/state/useAlgoStore';
import { applyResolvedTheme, resolveTheme } from '../lib/theme/theme';
import { cn } from '../lib/utils/cn';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const LEFT_PANEL_MIN_WIDTH = 250;
const RIGHT_PANEL_MIN_WIDTH = 280;
const LEFT_PANEL_MAX_WIDTH = 560;
const RIGHT_PANEL_MAX_WIDTH = 600;
const LEFT_PANEL_DEFAULT_WIDTH = 320;
const RIGHT_PANEL_DEFAULT_WIDTH = 360;
const SIDE_PANEL_COLLAPSED_WIDTH = 64;
const CENTER_PANEL_MIN_WIDTH = 560;
const PANEL_RESIZER_WIDTH = 10;
const COMPACT_LAYOUT_BREAKPOINT = 1180;
const PANEL_BOUNCE_MS = 360;
const SHORTCUT_MODULE_ORDER: ModuleId[] = ['stack', 'queue', 'heap', 'tree', 'trie', 'unionfind'];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  if (target.closest('.cm-editor')) {
    return true;
  }

  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

function resolveLeftPanelMax(totalWidth: number, effectiveRightWidth: number): number {
  const layoutCap = totalWidth - (PANEL_RESIZER_WIDTH * 2) - CENTER_PANEL_MIN_WIDTH - effectiveRightWidth;
  return Math.max(
    LEFT_PANEL_MIN_WIDTH,
    Math.min(LEFT_PANEL_MAX_WIDTH, layoutCap)
  );
}

function resolveRightPanelMax(totalWidth: number, effectiveLeftWidth: number): number {
  const layoutCap = totalWidth - (PANEL_RESIZER_WIDTH * 2) - CENTER_PANEL_MIN_WIDTH - effectiveLeftWidth;
  return Math.max(
    RIGHT_PANEL_MIN_WIDTH,
    Math.min(RIGHT_PANEL_MAX_WIDTH, layoutCap)
  );
}

export function App() {
  const activeModule = useAlgoStore((state) => state.activeModule);
  const setActiveModule = useAlgoStore((state) => state.setActiveModule);
  const resetActiveStructure = useAlgoStore((state) => state.resetActiveStructure);
  const prevStep = useAlgoStore((state) => state.prevStep);
  const nextStep = useAlgoStore((state) => state.nextStep);
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
  const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_PANEL_DEFAULT_WIDTH);
  const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT_WIDTH);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);
  const [leftPanelMotion, setLeftPanelMotion] = useState<'none' | 'collapse' | 'expand'>('none');
  const [rightPanelMotion, setRightPanelMotion] = useState<'none' | 'collapse' | 'expand'>('none');
  const [lastLeftExpandedWidth, setLastLeftExpandedWidth] = useState(LEFT_PANEL_DEFAULT_WIDTH);
  const [lastRightExpandedWidth, setLastRightExpandedWidth] = useState(RIGHT_PANEL_DEFAULT_WIDTH);
  const [inspectorTimelineOpen, setInspectorTimelineOpen] = useState(false);
  const [scriptConsoleOpen, setScriptConsoleOpen] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= COMPACT_LAYOUT_BREAKPOINT : false
  );
  const mainGridRef = useRef<HTMLElement | null>(null);

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
    const syncLayoutMode = () => {
      setIsCompactLayout(window.innerWidth <= COMPACT_LAYOUT_BREAKPOINT);
    };

    syncLayoutMode();
    window.addEventListener('resize', syncLayoutMode);
    return () => {
      window.removeEventListener('resize', syncLayoutMode);
    };
  }, []);

  useEffect(() => {
    if (!isCompactLayout) {
      return;
    }

    if (leftPanelCollapsed) {
      setLeftPanelCollapsed(false);
    }
    if (rightPanelCollapsed) {
      setRightPanelCollapsed(false);
    }
  }, [isCompactLayout, leftPanelCollapsed, rightPanelCollapsed]);

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
    if (leftPanelMotion === 'none' && rightPanelMotion === 'none') {
      return;
    }

    const timer = window.setTimeout(() => {
      setLeftPanelMotion('none');
      setRightPanelMotion('none');
    }, PANEL_BOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [leftPanelMotion, rightPanelMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (event.key === 'Escape') {
        setHelpOpen(false);
        setCommandPaletteOpen(false);
        return;
      }

      if (helpOpen || commandPaletteOpen || isTypingTarget(event.target)) {
        return;
      }

      if (/^[1-6]$/.test(event.key)) {
        const moduleIndex = Number(event.key) - 1;
        const targetModule = SHORTCUT_MODULE_ORDER[moduleIndex];
        if (targetModule) {
          event.preventDefault();
          setActiveModule(targetModule);
        }
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        resetActiveStructure();
        return;
      }

      if (key === 'n') {
        event.preventDefault();
        nextStep();
        return;
      }

      if (key === 'p') {
        event.preventDefault();
        prevStep();
        return;
      }

      if (key === 'a') {
        event.preventDefault();
        toggleAutoplay();
        return;
      }

      if (key === 'i' && !isCompactLayout) {
        event.preventDefault();
        if (rightPanelCollapsed) {
          setRightPanelMotion('expand');
          setRightPanelCollapsed(false);
        } else {
          setLastRightExpandedWidth(rightPanelWidth);
          setRightPanelMotion('collapse');
          setRightPanelCollapsed(true);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    commandPaletteOpen,
    helpOpen,
    isCompactLayout,
    nextStep,
    prevStep,
    rightPanelCollapsed,
    rightPanelWidth,
    resetActiveStructure,
    setActiveModule,
    setCommandPaletteOpen,
    setHelpOpen,
    toggleAutoplay
  ]);

  useEffect(() => {
    if (isCompactLayout) {
      return;
    }

    const total = mainGridRef.current?.clientWidth;
    if (!total) {
      return;
    }

    const effectiveLeft = leftPanelCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : leftPanelWidth;
    const effectiveRight = rightPanelCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : rightPanelWidth;
    const availableSideSpace = total - (PANEL_RESIZER_WIDTH * 2) - CENTER_PANEL_MIN_WIDTH;

    if (availableSideSpace <= 0) {
      return;
    }

    if (!leftPanelCollapsed) {
      const nextLeft = clamp(leftPanelWidth, LEFT_PANEL_MIN_WIDTH, resolveLeftPanelMax(total, effectiveRight));
      if (nextLeft !== leftPanelWidth) {
        setLeftPanelWidth(nextLeft);
        setLastLeftExpandedWidth(nextLeft);
      }
    }

    if (!rightPanelCollapsed) {
      const nextRight = clamp(
        rightPanelWidth,
        RIGHT_PANEL_MIN_WIDTH,
        resolveRightPanelMax(total, effectiveLeft)
      );
      if (nextRight !== rightPanelWidth) {
        setRightPanelWidth(nextRight);
        setLastRightExpandedWidth(nextRight);
      }
    }
  }, [
    isCompactLayout,
    leftPanelCollapsed,
    leftPanelWidth,
    rightPanelCollapsed,
    rightPanelWidth
  ]);

  const toggleLeftPanel = () => {
    if (leftPanelCollapsed) {
      const total = mainGridRef.current?.clientWidth;
      const effectiveRight = rightPanelCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : rightPanelWidth;
      const max = total ? resolveLeftPanelMax(total, effectiveRight) : LEFT_PANEL_MAX_WIDTH;
      const restored = clamp(lastLeftExpandedWidth, LEFT_PANEL_MIN_WIDTH, max);
      setLeftPanelWidth(restored);
      setLeftPanelMotion('expand');
      setLeftPanelCollapsed(false);
      return;
    }

    setLastLeftExpandedWidth(leftPanelWidth);
    setLeftPanelMotion('collapse');
    setLeftPanelCollapsed(true);
  };

  const toggleRightPanel = () => {
    if (rightPanelCollapsed) {
      const total = mainGridRef.current?.clientWidth;
      const effectiveLeft = leftPanelCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : leftPanelWidth;
      const max = total ? resolveRightPanelMax(total, effectiveLeft) : RIGHT_PANEL_MAX_WIDTH;
      const restored = clamp(lastRightExpandedWidth, RIGHT_PANEL_MIN_WIDTH, max);
      setRightPanelWidth(restored);
      setRightPanelMotion('expand');
      setRightPanelCollapsed(false);
      return;
    }

    setLastRightExpandedWidth(rightPanelWidth);
    setRightPanelMotion('collapse');
    setRightPanelCollapsed(true);
  };

  const startResize = (side: 'left' | 'right') => (event: { clientX: number; preventDefault: () => void }) => {
    if (isCompactLayout) {
      return;
    }

    event.preventDefault();

    const mainGrid = mainGridRef.current;
    if (!mainGrid) {
      return;
    }

    const startX = event.clientX;
    const startLeftCollapsed = leftPanelCollapsed;
    const startRightCollapsed = rightPanelCollapsed;
    const startLeftWidth = startLeftCollapsed ? lastLeftExpandedWidth : leftPanelWidth;
    const startRightWidth = startRightCollapsed ? lastRightExpandedWidth : rightPanelWidth;
    const startLeftEffective = startLeftCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : startLeftWidth;
    const startRightEffective = startRightCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : startRightWidth;

    if (side === 'left' && startLeftCollapsed) {
      setLeftPanelMotion('expand');
      setLeftPanelCollapsed(false);
      setLeftPanelWidth(startLeftWidth);
    }

    if (side === 'right' && startRightCollapsed) {
      setRightPanelMotion('expand');
      setRightPanelCollapsed(false);
      setRightPanelWidth(startRightWidth);
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      const total = mainGrid.clientWidth;
      const delta = moveEvent.clientX - startX;

      if (side === 'left') {
        const maxLeft = resolveLeftPanelMax(total, startRightEffective);
        const nextLeft = clamp(
          startLeftWidth + delta,
          LEFT_PANEL_MIN_WIDTH,
          maxLeft
        );
        setLeftPanelWidth(nextLeft);
        setLastLeftExpandedWidth(nextLeft);
        return;
      }

      const maxRight = resolveRightPanelMax(total, startLeftEffective);
      const nextRight = clamp(
        startRightWidth - delta,
        RIGHT_PANEL_MIN_WIDTH,
        maxRight
      );
      setRightPanelWidth(nextRight);
      setLastRightExpandedWidth(nextRight);
    };

    const stopResizing = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopResizing);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopResizing);
  };

  const effectiveLeftWidth = leftPanelCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : leftPanelWidth;
  const effectiveRightWidth = rightPanelCollapsed ? SIDE_PANEL_COLLAPSED_WIDTH : rightPanelWidth;
  const mainGridStyle = isCompactLayout
    ? undefined
    : {
        gridTemplateColumns: `${effectiveLeftWidth}px ${PANEL_RESIZER_WIDTH}px minmax(${CENTER_PANEL_MIN_WIDTH}px, 1fr) ${PANEL_RESIZER_WIDTH}px ${effectiveRightWidth}px`
      };

  return (
    <div className="app-shell">
      <TopBar inspectorOpen={!rightPanelCollapsed} onToggleInspector={toggleRightPanel} />

      <section className="workspace-shell" aria-label="Algorithm workspace">
        <main
          ref={mainGridRef}
          className={cn('main-grid', !isCompactLayout && 'main-grid-resizable')}
          style={mainGridStyle}
        >
          <Panel
            className={cn(
              'left-panel',
              leftPanelCollapsed && 'panel-collapsed',
              leftPanelMotion === 'collapse' && 'panel-bounce-collapse',
              leftPanelMotion === 'expand' && 'panel-bounce-expand'
            )}
            title="Controls"
            subtitle={activeModuleMeta.description}
            collapsed={leftPanelCollapsed}
            collapsedLabel="Controls"
            headerActions={
              !isCompactLayout && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="panel-collapse-btn"
                  onClick={toggleLeftPanel}
                  aria-label={leftPanelCollapsed ? 'Expand controls panel' : 'Collapse controls panel'}
                  aria-expanded={!leftPanelCollapsed}
                >
                  {leftPanelCollapsed ? '›' : '‹'}
                </Button>
              )
            }
          >
            <div className="control-stack">
              <div className="module-controls">
                {activeModule === 'stack' && <StackControls />}
                {activeModule === 'queue' && <QueueControls />}
                {activeModule === 'heap' && <HeapControls />}
                {activeModule === 'tree' && <TreeControls />}
                {activeModule === 'trie' && <TrieControls />}
                {activeModule === 'unionfind' && <UnionFindControls />}
              </div>
              <section className={cn('script-console-shell', scriptConsoleOpen && 'script-console-shell-open')}>
                <button
                  type="button"
                  className="script-console-toggle"
                  onClick={() => setScriptConsoleOpen((open) => !open)}
                  aria-expanded={scriptConsoleOpen}
                >
                  <span>Script Console</span>
                  <small>{scriptConsoleOpen ? 'Hide' : 'Show'}</small>
                </button>
                {scriptConsoleOpen && <PythonConsole />}
              </section>
            </div>
          </Panel>

          {!isCompactLayout && (
            <button
              type="button"
              className="panel-resizer"
              aria-label="Resize controls panel"
              onPointerDown={startResize('left')}
            />
          )}

          <Panel
            className="center-panel"
            title={activeModuleMeta.title}
            subtitle={
              activeModule === 'unionfind'
                ? activeModuleMeta.description
                : `Time Complexity: ${activeModuleMeta.complexityHint}`
            }
          >
            {activeModule === 'stack' && <StackModule />}
            {activeModule === 'queue' && <QueueModule />}
            {activeModule === 'heap' && <HeapModule />}
            {activeModule === 'tree' && <TreeModule />}
            {activeModule === 'trie' && <TrieModule />}
            {activeModule === 'unionfind' && <UnionFindModule />}
          </Panel>

          {!isCompactLayout && (
            <button
              type="button"
              className="panel-resizer"
              aria-label="Resize operation details panel"
              onPointerDown={startResize('right')}
            />
          )}

          <Panel
            className={cn(
              'right-panel',
              rightPanelCollapsed && 'panel-collapsed',
              rightPanelMotion === 'collapse' && 'panel-bounce-collapse',
              rightPanelMotion === 'expand' && 'panel-bounce-expand'
            )}
            title="Inspector"
            subtitle="Optional timeline playback and history"
            collapsed={rightPanelCollapsed}
            collapsedLabel="Inspector"
            headerActions={
              !isCompactLayout && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="panel-collapse-btn"
                  onClick={toggleRightPanel}
                  aria-label={rightPanelCollapsed ? 'Expand details panel' : 'Collapse details panel'}
                  aria-expanded={!rightPanelCollapsed}
                >
                  {rightPanelCollapsed ? '‹' : '›'}
                </Button>
              )
            }
          >
            <article
              className={cn(
                'step-card',
                currentTimelineStep.isError && 'step-card-error',
                stepUpdated && 'step-card-updated'
              )}
              aria-live="polite"
            >
              <h3>{currentTimelineStep.title}</h3>
              <MessageBubble
                variant={currentTimelineStep.isError ? 'error' : 'success'}
              >
                {currentTimelineStep.description}
              </MessageBubble>
            </article>

            <section
              className={cn('inspector-timeline', inspectorTimelineOpen && 'inspector-timeline-open')}
              aria-label="Timeline and playback"
            >
              <button
                type="button"
                className="inspector-timeline-toggle"
                onClick={() => setInspectorTimelineOpen((open) => !open)}
                aria-expanded={inspectorTimelineOpen}
              >
                <span>Timeline & Playback</span>
                <small>{inspectorTimelineOpen ? 'Hide' : 'Show'}</small>
              </button>

              {inspectorTimelineOpen && (
                <>
                  <TimelineBar embedded />
                  <div className="log-header">
                    <h4>Timeline Log</h4>
                    <p>{totalSteps} entries</p>
                  </div>
                  <OperationLog />
                </>
              )}
            </section>
          </Panel>
        </main>
      </section>
      <FeedbackFooter />
      <CommandPalette />
      <HelpModal />

    </div>
  );
}

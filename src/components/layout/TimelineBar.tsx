import { useActiveSessionMeta, useAlgoStore } from '../../lib/state/useAlgoStore';
import { Button } from '../ui/Button';

export function TimelineBar() {
  const autoplay = useAlgoStore((state) => state.autoplay);
  const prevStep = useAlgoStore((state) => state.prevStep);
  const nextStep = useAlgoStore((state) => state.nextStep);
  const jumpToStep = useAlgoStore((state) => state.jumpToStep);
  const toggleAutoplay = useAlgoStore((state) => state.toggleAutoplay);
  const { currentStep, totalSteps } = useActiveSessionMeta();

  return (
    <footer className="timeline-bar" aria-label="Timeline controls">
      <div className="timeline-actions">
        <Button size="sm" variant="secondary" onClick={prevStep} disabled={currentStep <= 0}>
          Previous
          <kbd>P</kbd>
        </Button>
        <Button
          size="sm"
          variant={autoplay ? 'danger' : 'primary'}
          onClick={toggleAutoplay}
          disabled={totalSteps <= 1}
        >
          {autoplay ? 'Pause' : 'Autoplay'}
          <kbd>A</kbd>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={nextStep}
          disabled={currentStep >= totalSteps - 1}
        >
          Next
          <kbd>N</kbd>
        </Button>
      </div>

      <div className="timeline-slider-wrap">
        <input
          className="timeline-slider"
          type="range"
          aria-label="Timeline step"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(event) => jumpToStep(Number(event.target.value))}
        />
      </div>

      <p className="timeline-meta">
        Step <strong>{currentStep + 1}</strong> of <strong>{totalSteps}</strong>
      </p>
    </footer>
  );
}

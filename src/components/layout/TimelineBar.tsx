import type { CSSProperties } from 'react';
import { useActiveSessionMeta, useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/Button';
import { IconChevronLeft, IconChevronRight, IconPause, IconPlay } from '../ui/icons';

interface TimelineBarProps {
  embedded?: boolean;
}

export function TimelineBar({ embedded = false }: TimelineBarProps) {
  const autoplay = useAlgoStore((state) => state.autoplay);
  const prevStep = useAlgoStore((state) => state.prevStep);
  const nextStep = useAlgoStore((state) => state.nextStep);
  const jumpToStep = useAlgoStore((state) => state.jumpToStep);
  const toggleAutoplay = useAlgoStore((state) => state.toggleAutoplay);
  const { currentStep, totalSteps } = useActiveSessionMeta();
  const progress = totalSteps <= 1 ? 0 : (currentStep / (totalSteps - 1)) * 100;
  const sliderStyle = { '--timeline-progress': `${progress}%` } as CSSProperties;

  return (
    <div className={cn('timeline-bar', embedded && 'timeline-bar-embedded')} aria-label="Timeline controls">
      <div className="timeline-left">
        <Button
          size="sm"
          variant={autoplay ? 'danger' : 'primary'}
          iconOnly
          className="timeline-autoplay-btn"
          onClick={toggleAutoplay}
          disabled={totalSteps <= 1}
          aria-label={autoplay ? 'Pause autoplay' : 'Start autoplay'}
          aria-keyshortcuts="A"
          title={autoplay ? 'Pause autoplay (A)' : 'Start autoplay (A)'}
        >
          {autoplay ? <IconPause className="timeline-control-icon" /> : <IconPlay className="timeline-control-icon" />}
          <span className="sr-only">{autoplay ? 'Pause' : 'Autoplay'}</span>
        </Button>
      </div>

      <div className="timeline-center">
        <div className="timeline-slider-wrap">
          <input
            className="timeline-slider"
            type="range"
            aria-label="Timeline step"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            style={sliderStyle}
            onChange={(event) => jumpToStep(Number(event.target.value))}
          />
        </div>
      </div>

      <div className="timeline-right">
        <div className="timeline-actions timeline-transport">
          <Button
            size="sm"
            variant="secondary"
            iconOnly
            onClick={prevStep}
            disabled={currentStep <= 0}
            aria-label="Previous step"
            aria-keyshortcuts="P"
            title="Previous step (P)"
          >
            <IconChevronLeft className="timeline-control-icon" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            iconOnly
            onClick={nextStep}
            disabled={currentStep >= totalSteps - 1}
            aria-label="Next step"
            aria-keyshortcuts="N"
            title="Next step (N)"
          >
            <IconChevronRight className="timeline-control-icon" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
        <p className="timeline-meta">
          Step <strong>{currentStep + 1}</strong> of <strong>{totalSteps}</strong>
        </p>
      </div>
    </div>
  );
}

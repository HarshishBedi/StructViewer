import { useActiveHistory, useActiveSessionMeta, useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

export function OperationLog() {
  const history = useActiveHistory();
  const { currentStep } = useActiveSessionMeta();
  const jumpToStep = useAlgoStore((state) => state.jumpToStep);

  const entries = history
    .map((step, stepIndex) => ({
      stepIndex,
      title: step.title,
      description: step.description
    }))
    .reverse();

  return (
    <div className="operation-log" aria-label="Operation timeline list">
      <div className="operation-list">
        {entries.map((entry) => (
          <div key={entry.stepIndex} className="log-row-wrap">
            <button
              type="button"
              className={cn('log-row', entry.stepIndex === currentStep && 'log-row-active')}
              onClick={() => jumpToStep(entry.stepIndex)}
              aria-label={`Jump to step ${entry.stepIndex + 1}: ${entry.title}. ${entry.description}`}
            >
              <span className="log-index">#{entry.stepIndex + 1}</span>
              <p>{entry.title}</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

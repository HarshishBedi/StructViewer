import type { CSSProperties } from 'react';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import { useActiveHistory, useActiveSessionMeta, useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

interface RowData {
  currentStep: number;
  titles: string[];
  descriptions: string[];
  jumpToStep: (stepIndex: number) => void;
}

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  return (
    <div style={style as CSSProperties} className="log-row-wrap">
      <button
        type="button"
        className={cn('log-row', index === data.currentStep && 'log-row-active')}
        onClick={() => data.jumpToStep(index)}
        aria-label={`Jump to step ${index + 1}: ${data.titles[index]}. ${data.descriptions[index]}`}
      >
        <span className="log-index">#{index + 1}</span>
        <p>{data.titles[index]}</p>
      </button>
    </div>
  );
}

export function OperationLog() {
  const history = useActiveHistory();
  const { currentStep } = useActiveSessionMeta();
  const jumpToStep = useAlgoStore((state) => state.jumpToStep);
  const titles = history.map((step) => step.title);
  const descriptions = history.map((step) => step.description);

  return (
    <div className="operation-log" aria-label="Operation timeline list">
      <List
        className="operation-list"
        width="100%"
        height={260}
        itemCount={titles.length}
        itemSize={42}
        itemData={{ currentStep, titles, descriptions, jumpToStep }}
      >
        {Row}
      </List>
    </div>
  );
}

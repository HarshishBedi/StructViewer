import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { StatusNote } from '../ui/StatusNote';

export function StackVisualizer() {
  const items = useAlgoStore((state) => state.stackSession.history[state.stackSession.cursor].state.items);
  const topValue = items.length > 0 ? items[items.length - 1] : null;
  const stackTone = topValue === null ? 'warning' : 'info';

  const reversed = useMemo(() => [...items].reverse(), [items]);

  return (
    <div className="viz-stack" aria-label="Stack visualization">
      <div className="stack-frame">
        <AnimatePresence>
          {reversed.map((value, index) => {
            const originalIndex = items.length - 1 - index;
            return (
              <motion.div
                key={`${value}-${originalIndex}-${items.length}`}
                className="stack-item"
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.95 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="stack-value">{value}</span>
                <span className="stack-index">idx {originalIndex}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <StatusNote
        tone={stackTone}
        badge={topValue === null ? 'Stack Empty' : 'Top Element'}
        message={topValue === null ? 'Top = empty' : `Top = ${topValue}`}
      />
    </div>
  );
}

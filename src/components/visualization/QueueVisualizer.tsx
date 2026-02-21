import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

export function QueueVisualizer() {
  const state = useAlgoStore(
    (store) => store.queueSession.history[store.queueSession.cursor].state
  );
  const { items, highlighted } = state;
  const row = useMemo(() => items.map((value, index) => ({ value, index })), [items]);

  return (
    <div className="viz-queue" aria-label="Queue visualization">
      <div className="queue-frame">
        <AnimatePresence initial={false}>
          {row.map((entry) => (
            <motion.div
              key={`queue-item-${entry.index}-${entry.value}`}
              className={cn(
                'queue-item',
                entry.index === 0 && 'queue-item-front',
                entry.index === row.length - 1 && 'queue-item-back',
                highlighted === entry.value && 'queue-item-highlighted'
              )}
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              layout
            >
              <span className="queue-item-value">{entry.value}</span>
              <span className="queue-item-index">#{entry.index}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

export function StackVisualizer() {
  const { items, stepTitle, stepTimestamp, stepIsError } = useAlgoStore(
    useShallow((state) => {
      const currentStep = state.stackSession.history[state.stackSession.cursor];
      return {
        items: currentStep.state.items,
        stepTitle: currentStep.title,
        stepTimestamp: currentStep.timestamp,
        stepIsError: currentStep.isError
      };
    })
  );
  const previousLength = useRef(items.length);
  const peekPulseTimerRef = useRef<number | null>(null);
  const peekPulseFrameRef = useRef<number | null>(null);
  const lengthDelta = items.length - previousLength.current;
  const isPushChange = lengthDelta > 0;
  const isPopChange = lengthDelta < 0;
  const [peekPulseActive, setPeekPulseActive] = useState(false);

  const reversed = useMemo(() => [...items].reverse(), [items]);

  useEffect(() => {
    previousLength.current = items.length;
  }, [items.length]);

  useEffect(() => {
    if (peekPulseTimerRef.current !== null) {
      window.clearTimeout(peekPulseTimerRef.current);
      peekPulseTimerRef.current = null;
    }

    if (peekPulseFrameRef.current !== null) {
      window.cancelAnimationFrame(peekPulseFrameRef.current);
      peekPulseFrameRef.current = null;
    }

    const isPeekStep = stepTitle.startsWith('Peek ');
    if (!isPeekStep || stepIsError || items.length === 0) {
      setPeekPulseActive(false);
      return;
    }

    setPeekPulseActive(false);
    peekPulseFrameRef.current = window.requestAnimationFrame(() => {
      setPeekPulseActive(true);
      peekPulseTimerRef.current = window.setTimeout(() => {
        setPeekPulseActive(false);
        peekPulseTimerRef.current = null;
      }, 380);
      peekPulseFrameRef.current = null;
    });

    return () => {
      if (peekPulseTimerRef.current !== null) {
        window.clearTimeout(peekPulseTimerRef.current);
        peekPulseTimerRef.current = null;
      }
      if (peekPulseFrameRef.current !== null) {
        window.cancelAnimationFrame(peekPulseFrameRef.current);
        peekPulseFrameRef.current = null;
      }
    };
  }, [items.length, stepIsError, stepTimestamp, stepTitle]);

  return (
    <div className="viz-stack" aria-label="Stack visualization">
      <div className="stack-frame" data-change={isPushChange ? 'push' : isPopChange ? 'pop' : 'none'}>
        <div className="stack-items">
          {items.length === 0 && <p className="stack-empty">Stack is empty</p>}
          <AnimatePresence initial={false} mode="popLayout">
            {reversed.map((value, index) => {
              const originalIndex = items.length - 1 - index;
              const isTop = index === 0;
              return (
                <motion.div
                  key={`stack-slot-${originalIndex}`}
                  className={cn(
                    'stack-item',
                    isTop && 'stack-item-top',
                    isTop && peekPulseActive && 'stack-item-peeked'
                  )}
                  layout
                  initial={isTop && isPushChange ? { opacity: 0, y: -18, scale: 0.96 } : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.95 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 420, damping: 30 },
                    duration: 0.24,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <span className="stack-value">{value}</span>
                  <div className="stack-meta">
                    {isTop && <span className="stack-top-chip">top</span>}
                    <span className="stack-index">idx {originalIndex}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Adapted from Aceternity UI by Manu Arora:
// https://ui.aceternity.com/registry/card-hover-effect.json
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useId, useMemo, useState, type Key, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import '../../styles/card-hover-effect.css';

export type HoverEffectProps<T> = {
  items: readonly T[];
  getKey: (item: T) => Key;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
};

export function HoverEffect<T>({ items, getKey, renderItem, className }: HoverEffectProps<T>) {
  const [hoveredKey, setHoveredKey] = useState<Key | null>(null);
  const [focusedKey, setFocusedKey] = useState<Key | null>(null);
  const reducedMotion = useReducedMotion();
  const groupId = useId();
  const activeKey = hoveredKey ?? focusedKey;
  const entries = useMemo(() => items.map((item, index) => ({ key: getKey(item), content: renderItem(item, index) })), [items, getKey, renderItem]);

  return <LayoutGroup id={groupId}>
    <div className={cn('hover-effect-grid', className)}>
      {entries.map(({ key, content }) => {
        return <div
          key={key}
          className="hover-effect-item"
          data-hover-card={String(key)}
          onPointerEnter={event => { if (event.pointerType !== 'touch') setHoveredKey(key); }}
          onPointerLeave={() => setHoveredKey(null)}
          onFocusCapture={() => { setFocusedKey(key); setHoveredKey(null); }}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocusedKey(null);
          }}
        >
          <AnimatePresence initial={false}>
            {activeKey === key && <motion.span
              aria-hidden="true"
              className="hover-effect-background pointer-events-none absolute -inset-1.5 z-0 rounded-[26px]"
              data-hover-background={String(key)}
              layoutId={reducedMotion ? undefined : 'hoverBackground'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
            />}
          </AnimatePresence>
          <div className="hover-effect-content">{content}</div>
        </div>;
      })}
    </div>
  </LayoutGroup>;
}

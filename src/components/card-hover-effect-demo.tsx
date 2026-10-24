// Aceternity's demo adapted to display Omnipedia's existing interactive cards.
// https://ui.aceternity.com/registry/card-hover-effect-demo.json
import type { ReactNode } from 'react';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { cn } from '@/lib/utils';

type CardHoverEffectDemoProps<T> = {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
};

export default function CardHoverEffectDemo<T extends { id: number }>({ items, renderItem, className }: CardHoverEffectDemoProps<T>) {
  return <HoverEffect items={items} getKey={item => item.id} renderItem={renderItem} className={cn('alien-grid', className)} />;
}

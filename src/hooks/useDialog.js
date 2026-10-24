import { useEffect } from 'react';

export default function useDialog(ref, onClose, active = true) {
  useEffect(() => {
    if (!active) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const container = ref.current;
    const selector = 'button:not([disabled]), a[href], input, select, summary, [tabindex="0"]';
    const focusable = () => [...container.querySelectorAll(selector)].filter(element => element.getClientRects().length > 0);
    (focusable()[0] || container).focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items.at(-1);
        if (!items.length) { event.preventDefault(); return; }
        if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKey); if (previousFocus?.isConnected) previousFocus.focus(); };
  }, [ref, onClose, active]);
}

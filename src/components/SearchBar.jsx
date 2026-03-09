import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({ value, onChange, resultCount, total }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="SEARCH ALIEN DATABASE... (press / to focus)"
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-11 pr-20 py-3 text-[var(--text)] placeholder-[var(--text-dim)] outline-none transition-all focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '0.1em' }}
          id="alien-search"
          aria-label="Search aliens"
        />
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            aria-label="Clear search"
          >
            <FiX size={18} />
          </button>
        )}
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          {resultCount}/{total}
        </span>
      </div>
    </div>
  );
}

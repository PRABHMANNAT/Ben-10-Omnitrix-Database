import { useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);
  useEffect(() => {
    const focusSearch = (event) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable;
      if (event.key === '/' && !typing && !document.querySelector('[aria-modal="true"]')) { event.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  return <div className="search-box"><FiSearch aria-hidden="true" /><input ref={inputRef} id="alien-search" aria-label="Search the archive" placeholder="Search name, species, or ability…" value={value} onChange={(event) => onChange(event.target.value)} />{value ? <button aria-label="Clear search" onClick={() => { onChange(''); inputRef.current?.focus(); }}><FiX /></button> : <kbd aria-hidden="true">/</kbd>}</div>;
}

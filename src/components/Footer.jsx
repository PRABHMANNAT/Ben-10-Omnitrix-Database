export default function Footer() {
  return (
    <footer className="border-t mt-12 py-6 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
        OMNITRIX DATABASE v1.0 · 72 CLASSIFIED ALIEN ENTRIES · ACCESS LEVEL: PLUMBER
      </p>
      <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', opacity: 0.5 }}>
        Ben 10 is a trademark of Cartoon Network / Man of Action. This is a fan project.
      </p>
    </footer>
  );
}

import { useState } from 'react';
import artwork from '../data/artwork.json';
import { OmnitrixMark } from './Header';

export default function AlienArtwork({ alien, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  const conceptOnly = [70, 71].includes(alien.id);
  const description = conceptOnly ? `${alien.name} — non-canon concept by Thomas N. Perkins IV (AI-enhanced)` : alien.name;
  return failed ? <span className={`artwork-fallback ${className}`}><OmnitrixMark /><span>Artwork unavailable</span></span> : <img className={`alien-artwork ${alien.id === 50 ? 'scene-artwork' : ''} ${className}`} src={artwork[alien.id] || alien.image} alt={description} title={conceptOnly ? description : undefined} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}

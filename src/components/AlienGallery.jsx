import { useState } from 'react';
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import galleries from '../data/galleries.json';
import { firstActionIndex, wrapImageIndex } from '../lib/gallery';
import '../styles/gallery.css';

const labels = { design: 'Character artwork', power: 'Power in action', scene: 'Episode still', appearance: 'On screen', concept: 'Concept art', gameplay: 'Gameplay' };

function GalleryImage({ image, name }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="gallery-image-error"><FiImage /><p>Image unavailable.</p><a href={image.originalUrl} target="_blank" rel="noreferrer">View the original source <FiArrowUpRight /></a></div>
    : <img src={image.src} alt={`${name}: ${image.caption}`} width={image.width} height={image.height} decoding="async" onError={() => setFailed(true)} />;
}

export default function AlienGallery({ alien }) {
  const gallery = galleries[alien.id];
  const images = gallery?.images || [];
  const [selected, setSelected] = useState(() => firstActionIndex(images));
  if (!images.length) return <p>Images are being catalogued for this transformation.</p>;
  const image = images[selected];
  const select = index => setSelected(wrapImageIndex(index, images.length));
  return <section className="alien-gallery" data-alien-gallery aria-label={`${alien.name} image gallery`} onKeyDown={event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? images.length - 1 : selected + (event.key === 'ArrowRight' ? 1 : -1));
  }}>
    <div className="gallery-heading"><span className="eyebrow">VISUAL ARCHIVE</span><span>{String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span></div>
    {gallery.conceptOnly && <p className="gallery-notice">Non-canon concepts by Thomas N. Perkins IV. This alien never appeared on screen; these images show the concept, its scale chart, and an isolated version.</p>}
    <figure className="gallery-figure">
      <div className={`gallery-stage ${image.kind === 'design' || image.kind === 'concept' ? 'gallery-stage-art' : ''}`}>
        <GalleryImage key={image.src} image={image} name={alien.name} />
        <div className="gallery-stage-label">{labels[image.kind] || 'Archive image'}{image.enhanced && <span>AI-enhanced</span>}</div>
      </div>
      <figcaption aria-live="polite" aria-atomic="true"><strong>{image.caption}</strong><span>{image.width.toLocaleString()} × {image.height.toLocaleString()} px{image.series ? ` · ${image.series}` : ''}</span></figcaption>
    </figure>
    <div className="gallery-navigation">
      <button className="icon-button" onClick={() => select(selected - 1)} aria-label="Previous image"><FiChevronLeft /></button>
      <div className="gallery-thumbnails" aria-label="Choose an image">{images.map((item, index) => <button key={item.id} onClick={() => select(index)} aria-pressed={selected === index} aria-label={`Image ${index + 1}: ${item.caption}`}><img src={item.src} alt="" loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>
      <button className="icon-button" onClick={() => select(selected + 1)} aria-label="Next image"><FiChevronRight /></button>
    </div>
    <div className="gallery-source"><div className="gallery-links"><a href={image.src} target="_blank" rel="noreferrer">Full resolution <FiArrowUpRight /></a><a href={image.sourceFile} target="_blank" rel="noreferrer">Source & credits <FiArrowUpRight /></a></div><p>{image.credit}</p>{image.enhanced && <p>AI-assisted upscale from {image.sourceWidth} × {image.sourceHeight} px. Details may differ. <a href={image.originalUrl} target="_blank" rel="noreferrer">Compare the original.</a></p>}</div>
  </section>;
}

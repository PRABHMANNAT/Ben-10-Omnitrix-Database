export function wrapImageIndex(index, count) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

export function firstActionIndex(images) {
  const index = images.findIndex(image => ['power', 'scene', 'gameplay'].includes(image.kind));
  return Math.max(0, index);
}

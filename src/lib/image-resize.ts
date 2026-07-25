export function containSize(width: number, height: number, maxEdge: number) {
  if (width <= 0 || height <= 0 || maxEdge <= 0) {
    throw new RangeError("Image dimensions and maxEdge must be positive");
  }

  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

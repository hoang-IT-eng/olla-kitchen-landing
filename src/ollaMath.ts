export function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.min(max, Math.max(min, val));
}

export function smoothstep(q: number): number {
  const cq = clamp(q, 0, 1);
  return cq * cq * (3 - 2 * cq);
}

export function calculateFall(q: number): number {
  const cq = clamp(q, 0, 1);
  return Math.pow(cq, 1.75);
}

export function calculateGrillFrame(q: number, cachedFrames: number = 48): number {
  if (cachedFrames <= 0) return 0;
  const normalized = clamp((q - 0.12) / 0.72, 0, 1);
  const frame = Math.round(normalized * (cachedFrames - 1));
  return clamp(frame, 0, cachedFrames - 1);
}

export function chromaKeyPixel(
  r: number,
  g: number,
  b: number,
  threshold: number = 18,
  softRange: number = 52
): { r: number; g: number; b: number; a: number } {
  const m = Math.max(r, b);
  const k = g - m;

  if (k > threshold) {
    const alpha = Math.max(0, 1 - (k - threshold) / softRange);
    const despilledG = Math.min(g, m + 6);
    return {
      r,
      g: despilledG,
      b,
      a: Math.floor(alpha * 255),
    };
  }

  return { r, g, b, a: 255 };
}

export function calculateCoverFit(
  containerW: number,
  containerH: number,
  intrinsicW: number = 2688,
  intrinsicH: number = 1520
) {
  const sc = Math.max(containerW / intrinsicW, containerH / intrinsicH);
  const ox = (containerW - intrinsicW * sc) / 2;
  const oy = (containerH - intrinsicH * sc) / 2;
  const displayedH = intrinsicH * sc;
  return { sc, ox, oy, displayedH };
}

export function calculateLandingTarget(
  containerX: number,
  containerY: number,
  containerW: number,
  containerH: number,
  imageRelX: number = 0.489,
  imageRelY: number = 0.641
) {
  const { sc, ox, oy, displayedH } = calculateCoverFit(containerW, containerH);
  const gx = containerX + ox + imageRelX * 2688 * sc;
  const gy = containerY + oy + imageRelY * 1520 * sc;
  const c1 = displayedH * 0.2 / 0.83;
  const x1 = gx;
  const y1 = gy - c1 * 0.91 + c1 / 2;
  return { gx, gy, c1, x1, y1, displayedH };
}

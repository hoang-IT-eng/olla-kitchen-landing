import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  smoothstep,
  calculateFall,
  calculateGrillFrame,
  chromaKeyPixel,
  calculateCoverFit,
  calculateLandingTarget,
} from './ollaMath';

test('clamp restricts values properly', () => {
  assert.equal(clamp(0.5, 0, 1), 0.5);
  assert.equal(clamp(-0.2, 0, 1), 0);
  assert.equal(clamp(1.5, 0, 1), 1);
});

test('smoothstep computes standard S-curve', () => {
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(1), 1);
  assert.equal(smoothstep(0.5), 0.5);
});

test('calculateFall follows q^1.75 acceleration', () => {
  assert.equal(calculateFall(0), 0);
  assert.equal(calculateFall(1), 1);
  const mid = calculateFall(0.5);
  assert.ok(mid < 0.5, 'Gravity acceleration starts slow');
  assert.ok(Math.abs(mid - Math.pow(0.5, 1.75)) < 1e-6);
});

test('calculateGrillFrame starts at 0, opens, and closes at q=0.84', () => {
  assert.equal(calculateGrillFrame(0, 48), 0);
  assert.equal(calculateGrillFrame(0.12, 48), 0);
  assert.equal(calculateGrillFrame(0.48, 48), 24);
  assert.equal(calculateGrillFrame(0.84, 48), 47);
  assert.equal(calculateGrillFrame(1.0, 48), 47);
});

test('chromaKeyPixel leaves non-green pixel alone', () => {
  const pixel = chromaKeyPixel(200, 50, 50); // Red
  assert.equal(pixel.a, 255);
  assert.equal(pixel.g, 50);
});

test('chromaKeyPixel despills and sets alpha for chroma green', () => {
  // Pure green: r=0, g=255, b=0 -> m=0, k=255 > 70 -> alpha=0, despill g <= 6
  const pureGreen = chromaKeyPixel(0, 255, 0);
  assert.equal(pureGreen.a, 0);
  assert.equal(pureGreen.g, 6);

  // Slight green fringe: r=50, g=80, b=50 -> m=50, k=30 -> k > 18
  const fringe = chromaKeyPixel(50, 80, 50);
  assert.ok(fringe.a < 255 && fringe.a > 0);
  assert.equal(fringe.g, 56); // m + 6 = 56
});

test('calculateCoverFit scales to cover aspect ratio', () => {
  const fit = calculateCoverFit(1200, 800, 2688, 1520);
  assert.ok(fit.sc > 0);
  assert.ok(fit.displayedH >= 800);
});

test('calculateLandingTarget accurately finds gap and counter level', () => {
  const target = calculateLandingTarget(0, 1000, 1200, 800);
  assert.ok(target.gx > 0);
  assert.ok(target.gy > 1000);
  assert.ok(target.c1 > 0);
  // Bottom of frame (91%) should rest on gy: y1 + 0.91 * c1 - c1 / 2 == gy
  assert.ok(Math.abs((target.y1 + target.c1 * 0.91 - target.c1 / 2) - target.gy) < 1e-4);
});

export type Palette = "viridis" | "cool" | "magma";

export function colormap(v: number, palette: Palette = "viridis"): string {
  const t = Math.max(0, Math.min(1, v));
  if (palette === "cool") {
    const h = 260 - 70 * t;
    const l = 0.4 + 0.5 * t;
    const c = 0.23 - 0.04 * Math.abs(t - 0.5) * 2;
    return `oklch(${l} ${c} ${h})`;
  }
  if (palette === "magma") {
    const h = 20 + 60 * t - 60 * (1 - t);
    const l = 0.15 + 0.8 * t;
    const c = 0.07 + 0.24 * t * (1 - t * 0.3);
    return `oklch(${l} ${c} ${h < 0 ? h + 360 : h})`;
  }
  // viridis
  const stops: [number, number, number][] = [
    [0.22, 0.22, 280], [0.36, 0.23, 250], [0.55, 0.21, 200],
    [0.72, 0.22, 155], [0.85, 0.24, 110], [0.94, 0.25, 90],
  ];
  const f = t * (stops.length - 1);
  const i = Math.floor(f);
  const k = f - i;
  const a = stops[Math.min(i, stops.length - 1)];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const l = a[0] + (b[0] - a[0]) * k;
  const c = a[1] + (b[1] - a[1]) * k;
  const h = a[2] + (b[2] - a[2]) * k;
  return `oklch(${l} ${c} ${h})`;
}

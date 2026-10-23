import type { CSSProperties } from 'react';
export const isColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

export function themeVariables(primary = '#2f855a', accent = '#14a5a0'): CSSProperties {
  if (!isColor(primary) || !isColor(accent)) throw new Error('Invalid theme color');
  const variables: Record<string, string> = {};
  // Darken bright user colors until white button labels meet WCAG AA contrast.
  const readable = (hex: string) => {
    let rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const luminance = () => rgb.map(v => { const c = v / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    while (1.05 / (luminance() + .05) < 4.5) rgb = rgb.map(v => Math.floor(v * .95));
    return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
  };
  for (const [family, color] of [['forest', primary], ['sage', primary], ['mint', accent]]) {
    for (const [step, lightness] of [[50,97],[100,92],[200,82],[300,70],[400,58],[500,44],[600,36],[700,29],[800,23],[900,17],[950,10]]) {
      variables[`--color-${family}-${step}`] = `hsl(from ${color} h s ${lightness}%)`;
    }
  }
  variables['--color-forest-500'] = readable(primary);
  variables['--color-forest-700'] = `color-mix(in srgb, ${readable(primary)} 75%, black)`;
  variables['--brand-primary'] = primary;
  variables['--brand-accent'] = accent;
  variables['--color-canvas'] = `color-mix(in srgb, ${primary} 4%, white)`;
  variables['--color-ink'] = `color-mix(in srgb, ${primary} 20%, #111111)`;
  variables['--color-ink-soft'] = `color-mix(in srgb, ${primary} 20%, #444444)`;
  variables['--grad-forest'] = 'linear-gradient(135deg, var(--color-forest-500), var(--color-forest-700))';
  variables['--grad-river'] = `linear-gradient(120deg, ${readable(primary)}, ${readable(accent)})`;
  variables['--grad-meadow'] = 'linear-gradient(135deg, var(--color-forest-50), var(--color-mint-100))';
  variables['--grad-mist'] = 'linear-gradient(180deg, var(--color-canvas), var(--color-forest-100))';
  return variables as CSSProperties;
}

"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogPlan } from '@/lib/catalog';
import { Button } from '@/components/ui/Button';
import { themeVariables, isColor } from '@/lib/theme';

const field = 'mt-1 w-full min-w-0 rounded-xl border border-forest-200 bg-white p-3 text-forest-950';
export function StoreManager({ products, primaryColor, accentColor }: { products: CatalogPlan[]; primaryColor: string; accentColor: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [primary, setPrimary] = useState(primaryColor);
  const [accent, setAccent] = useState(accentColor);
  const product = products.find(p => p.slug === selected);

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/products', { method: selected ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        slug: selected || data.get('slug'), name: data.get('name'), price: Number(data.get('price')),
        durationDays: Number(data.get('durationDays')), tagline: data.get('tagline'), description: data.get('description'),
        benefits: String(data.get('benefits')).split('\n').map(v => v.trim()).filter(Boolean),
        roleId: String(data.get('roleId') ?? '').trim() || null, enabled: data.get('enabled') === 'on',
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not save product.');
      setSelected(String(selected || data.get('slug'))); setMessage('Product saved. Storefront and checkout now use these details.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save product.'); }
    finally { setBusy(false); }
  }
  async function saveTheme() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ primaryColor: primary, accentColor: accent }) });
      if (!response.ok) throw new Error('Could not save theme. Enter valid hex colors.');
      const style = themeVariables(primary, accent);
      for (const [key, value] of Object.entries(style)) document.documentElement.style.setProperty(key, String(value));
      setMessage('Theme saved for everyone visiting the store.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save theme.'); }
    finally { setBusy(false); }
  }
  return <section className="mt-12 space-y-8 rounded-4xl border border-forest-100 bg-white/80 p-6 sm:p-8">
    <div><h2 className="font-display text-2xl text-forest-950">Products & appearance</h2><p className="mt-2 text-sm text-ink-soft">Manage this server's products and storefront colors. Existing purchases keep their original price and role target.</p></div>
    {message && <p role="status" className="rounded-xl bg-mist p-3 text-sm">{message}</p>}
    <label className="block text-sm">Choose a product<select value={selected} disabled={busy} onChange={e => { setSelected(e.target.value); setMessage(''); }} className={field}><option value="">+ Add a new product</option>{products.map(p => <option key={p.slug} value={p.slug}>{p.name}{p.enabled ? '' : ' (hidden)'}</option>)}</select></label>
    <form key={selected + (product?.price ?? '')} onSubmit={saveProduct} className="grid gap-4 text-sm sm:grid-cols-2">
      <label>Name<input name="name" required maxLength={80} defaultValue={product?.name} className={field} /></label>
      <label>Product URL slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={2} maxLength={64} disabled={!!selected} defaultValue={selected} placeholder="creator-pass" className={field} /></label>
      <label>Price (₹)<input name="price" type="number" min={1} max={100000} required defaultValue={product?.price ?? 49} className={field} /></label>
      <label>Duration (days)<input name="durationDays" type="number" min={1} max={3650} required defaultValue={product?.durationDays ?? 30} className={field} /></label>
      <label className="sm:col-span-2">Short description<input name="tagline" maxLength={160} defaultValue={product?.tagline} className={field} /></label>
      <label className="sm:col-span-2">Description<textarea name="description" required maxLength={3000} rows={3} defaultValue={product?.description} className={field} /></label>
      <label className="sm:col-span-2">Benefits (one per line)<textarea name="benefits" required rows={4} defaultValue={product?.benefits.join('\n')} className={field} /></label>
      <label className="sm:col-span-2">Discord role ID<input name="roleId" pattern="[1-9][0-9]{16,19}" defaultValue={product?.roleId ?? ''} placeholder="Required to publish a new product" className={field} /></label>
      <label className="flex items-center gap-2"><input name="enabled" type="checkbox" defaultChecked={product?.enabled ?? false} /> Published in shop</label>
      <p className="text-xs text-ink-soft sm:col-span-2">Hide a product to stop new purchases. Duration is displayed but automatic expiry is not implemented yet.</p>
      <Button type="submit" disabled={busy}>{busy ? 'Saving…' : selected ? 'Save product' : 'Add product'}</Button>
    </form>
    <div className="border-t border-forest-100 pt-6"><h3 className="font-display text-xl">Theme colors</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{[['Primary', primary, setPrimary], ['Accent', accent, setAccent]].map(([label, value, setter]) => {
        const update = setter as (value: string) => void; return <label key={String(label)} className="text-sm">{String(label)}<div className="mt-2 flex gap-2"><input aria-label={`${label} color picker`} type="color" value={isColor(String(value)) ? String(value) : '#000000'} onChange={e => update(e.target.value)} className="h-12 w-14 shrink-0" /><input aria-label={`${label} hex color`} value={String(value)} maxLength={7} onChange={e => update(e.target.value)} className={field} /></div></label>;
      })}</div>
      <div style={isColor(primary) && isColor(accent) ? themeVariables(primary, accent) : undefined} className="my-4 rounded-2xl bg-mist p-5"><span className="rounded-full bg-forest-grad px-4 py-2 text-sm text-white">Theme preview</span><p className="mt-4 text-sm text-forest-900">Color shades are adjusted for readable buttons and text.</p></div>
      <Button onClick={saveTheme} disabled={busy || !isColor(primary) || !isColor(accent)}>Save colors</Button>
      <p className="mt-4 text-sm text-ink-soft">The home banner automatically uses this Discord server's banner, refreshed within about five minutes. If unavailable, a theme-colored placeholder is shown.</p>
    </div>
  </section>;
}

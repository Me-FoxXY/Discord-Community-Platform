import { NextResponse } from 'next/server';
import { getGuild } from '@/lib/discord/guild';
export const dynamic = 'force-dynamic';
export async function GET() {
 const { id, data, status } = await getGuild();
 const hash = typeof data?.banner === 'string' && /^(a_)?[a-f0-9]+$/.test(data.banner) ? data.banner : null;
 const base = hash ? `https://cdn.discordapp.com/banners/${id}/${hash}` : null;
 return NextResponse.json({ url: base ? `${base}.${hash!.startsWith('a_') ? 'gif' : 'webp'}?size=1024` : null,
  staticUrl: base ? `${base}.webp?size=1024` : null, status: status === 'ready' && !hash ? 'no_banner' : status }, { headers: { 'Cache-Control': 'no-store' } });
}

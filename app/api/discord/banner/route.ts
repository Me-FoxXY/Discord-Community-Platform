import { NextResponse } from 'next/server';

export async function GET() {
  const guild = process.env.DISCORD_GUILD_ID;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!guild || !/^[1-9]\d{16,19}$/.test(guild) || !token) return NextResponse.json({ url: null });
  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guild}`, {
      headers: { Authorization: `Bot ${token}` }, next: { revalidate: 300 }, signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return NextResponse.json({ url: null });
    const data = await response.json();
    const hash = typeof data.banner === 'string' && /^(a_)?[a-f0-9]+$/.test(data.banner) ? data.banner : null;
    const base = hash ? `https://cdn.discordapp.com/banners/${guild}/${hash}` : null;
    return NextResponse.json({ url: base ? `${base}.${hash.startsWith('a_') ? 'gif' : 'webp'}?size=1024` : null,
      staticUrl: base ? `${base}.webp?size=1024` : null }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch { return NextResponse.json({ url: null }); }
}

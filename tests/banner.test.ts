import { afterEach, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/discord/banner/route';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it('returns animated and static variants of the configured server banner', async () => {
 vi.stubEnv('DISCORD_GUILD_ID', '123456789012345678'); vi.stubEnv('DISCORD_BOT_TOKEN', 'test-token');
 const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ banner: 'a_abcdef' }) }); vi.stubGlobal('fetch', fetch);
 expect(await (await GET()).json()).toEqual({ url: 'https://cdn.discordapp.com/banners/123456789012345678/a_abcdef.gif?size=1024', staticUrl: 'https://cdn.discordapp.com/banners/123456789012345678/a_abcdef.webp?size=1024', status: 'ready' });
});
it('uses the placeholder for absent banners and unavailable Discord', async () => {
 vi.stubEnv('DISCORD_GUILD_ID', '123456789012345678'); vi.stubEnv('DISCORD_BOT_TOKEN', 'test-token');
 const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ banner: null }) }); vi.stubGlobal('fetch', fetch);
 expect(await (await GET()).json()).toMatchObject({ url: null });
 fetch.mockRejectedValue(new Error('timeout'));
 expect(await (await GET()).json()).toMatchObject({ url: null });
});
it('does not call Discord with missing configuration', async () => {
 vi.stubEnv('DISCORD_BOT_TOKEN', ''); const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
 expect(await (await GET()).json()).toMatchObject({ url: null }); expect(fetch).not.toHaveBeenCalled();
});
